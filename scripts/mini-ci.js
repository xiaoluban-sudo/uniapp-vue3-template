/**
 * 微信小程序自动化构建 & 上传脚本
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ci from 'miniprogram-ci'

// --- 0. 常量定义与配置 ---
const ENV_CONFIG = {
  allow: ['dev', 'test', 'prod'],
  default: 'dev',
}

const UNI_BUILD_DIR = 'dist/build/mp-weixin'
const UNI_BUILD_ABS_DIR = path.resolve(process.cwd(), UNI_BUILD_DIR)
const QRCODE_OUTPUT_DIR = UNI_BUILD_ABS_DIR
const SETTING = { // 统一的上传/预览配置
  es6: true,
  minify: true,
  // 其他常用配置
  autoPrefixWXSS: true,
  disableUseStrict: false,
}

const MODE = process.argv[2]
const ENV_ARG = process.argv[3]
const PROJECT_ROOT = process.cwd()

// --- 1. 环境解析 ---
const inputEnv = (ENV_ARG || process.env.MINI_ENV || ENV_CONFIG.default).toLowerCase()
const ENV = ENV_CONFIG.allow.includes(inputEnv) ? inputEnv : ENV_CONFIG.default

console.log(`📌 当前构建环境: ${ENV}`)

// --- 2. 私钥 & AppID 解析 (优先使用环境变量) ---
function getAuthInfo() {
  const scriptsDir = path.resolve(PROJECT_ROOT, 'scripts')

  // 优先级 1: 环境变量
  let appid = process.env.MINI_APPID
  let privateKey = process.env.MINI_PRIVATE_KEY

  if (appid && privateKey) {
    console.log('🔑 使用环境变量 MINI_APPID 和 MINI_PRIVATE_KEY')
    return { appid, privateKey: privateKey.replace(/\\n/g, '\n').trim() }
  }

  // 优先级 2: 自动解析私钥文件
  if (!fs.existsSync(scriptsDir)) {
    console.error('❌ 未找到 scripts/ 目录，且环境变量未设置')
    process.exit(1)
  }

  const keyFile = fs.readdirSync(scriptsDir).find(f => /^private\.[^.]+\.key$/.test(f))
  if (!keyFile) {
    console.error(`❌ scripts/ 目录下未找到私钥文件 private.<appid>.key`)
    process.exit(1)
  }

  const match = keyFile.match(/^private\.(.+)\.key$/)
  appid = match ? match[1] : null

  if (!appid) {
    console.error(`❌ 无法从文件名解析 appid: ${keyFile}`)
    process.exit(1)
  }

  const keyPath = path.resolve(scriptsDir, keyFile)
  privateKey = fs.readFileSync(keyPath, 'utf8').replace(/\\n/g, '\n').trim()

  console.log(`🔑 使用私钥文件: ${keyFile}`)
  console.log(`📌 解析得到 appid: ${appid}`)

  return { appid, privateKey }
}

const { appid, privateKey } = getAuthInfo()

// --- 3. 规范化版本信息 ---
function getVersionInfo(env) {
  try {
    const pkgJson = JSON.parse(
      fs.readFileSync(path.resolve(PROJECT_ROOT, 'package.json'), 'utf8'),
    )
    const pkgVersion = pkgJson.version || '1.0.0'
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    const date = new Date()
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

    // CI 实际上传的 version 必须是 x.y.z 格式，建议使用 package.json 版本
    const uploadVersion = pkgVersion

    // 描述信息更详细，包含环境、版本、日期和 Commit
    const description = `[${env}] ${pkgVersion} (Build ${ymd}-${commit})`

    return {
      version: uploadVersion,
      desc: description,
    }
  }
  catch (e) {
    console.warn('⚠️ 获取 Git 版本失败，使用 fallback: 1.0.0', e)
    return {
      version: '1.0.0',
      desc: `[${env}] Fallback 1.0.0`,
    }
  }
}

const versionInfo = getVersionInfo(ENV)

// --- 4. miniprogram-ci Project 实例 ---
if (!fs.existsSync(UNI_BUILD_ABS_DIR)) {
  console.error(`❌ 找不到 uni-app 编译产物目录: ${UNI_BUILD_DIR}`)
  console.error('请先执行 uni-app 编译命令 (例如: npm run build:mp-weixin)')
  process.exit(1)
}

const project = new ci.Project({
  appid,
  type: 'miniProgram',
  // projectPath 必须指向小程序根目录（包含 app.json）
  projectPath: UNI_BUILD_ABS_DIR,
  privateKey,
  // 排除不需要上传的文件
  ignores: [
    'node_modules/**/*',
    'src/**/*',
    '.git/**/*',
    'dist/dev/**/*',
    'dist/build/h5/**/*', // 排除其他平台产物
  ],
})

// --- 5. 辅助函数：输出二维码 HTML ---
function writeQRCodeHtml(env, buildDir) {
  const filename = `preview-${env}.png`
  const html = `
<html>
  <body>
    <h2>小程序预览环境：${env}</h2>
    <img src="${filename}" style="width:240px;height:240px;" />
  </body>
</html>
  `

  const output = path.resolve(buildDir, `preview-${env}.html`)
  fs.writeFileSync(output, html, 'utf8')
  console.log(`📰 已输出二维码 HTML: ${output}`)
}

// --- 6. 主流程 ---
async function run() {
  // 确保二维码输出目录存在
  fs.mkdirSync(QRCODE_OUTPUT_DIR, { recursive: true })

  // ----------- preview -----------
  if (MODE === 'preview') {
    const qrcodePath = path.resolve(QRCODE_OUTPUT_DIR, `preview-${ENV}.png`)
    console.log(`📡 开始预览，描述: ${versionInfo.desc}`)

    const r = await ci.preview({
      project,
      desc: versionInfo.desc,
      setting: SETTING,
      qrcodeFormat: 'image',
      qrcodeOutputDest: qrcodePath,
    })

    console.log('📦 PREVIEW RESULT:\n', JSON.stringify(r, null, 2))
    writeQRCodeHtml(ENV, QRCODE_OUTPUT_DIR)

    return
  }

  // ----------- upload -----------
  if (MODE === 'upload') {
    console.log(`⬆️ 开始上传体验版 version=${versionInfo.version}, env=${ENV}`)

    const r = await ci.upload({
      project,
      version: versionInfo.version,
      desc: versionInfo.desc,
      setting: SETTING,
    })

    console.log('📦 UPLOAD RESULT:\n', JSON.stringify(r, null, 2))
    return
  }

  console.error('❌ 未识别命令：只能使用 preview 或 upload')
  process.exit(1)
}

// ---------------------- ERROR ----------------------
run().catch((e) => {
  console.error('❌ CI 执行失败：')
  // 打印完整错误信息
  console.error(e.stack || e)
  process.exit(1)
})
