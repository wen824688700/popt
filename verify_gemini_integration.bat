@echo off
echo =========================================
echo Gemini 集成验证脚本
echo =========================================
echo.

echo 1. 检查 ModelSelector 组件...
findstr /C:"Gemini 2.0" frontend\components\ModelSelector.tsx >nul
if %errorlevel% == 0 (
    echo    √ ModelSelector 包含 Gemini 2.0
) else (
    echo    × ModelSelector 不包含 Gemini 2.0
    exit /b 1
)

echo.
echo 2. 检查后端配置...
findstr /C:"GEMINI_API_KEY" backend\.env >nul
if %errorlevel% == 0 (
    echo    √ 后端 .env 包含 GEMINI_API_KEY
) else (
    echo    × 后端 .env 缺少 GEMINI_API_KEY
)

findstr /C:"gemini_api_key" backend\app\config.py >nul
if %errorlevel% == 0 (
    echo    √ config.py 包含 gemini_api_key
) else (
    echo    × config.py 缺少 gemini_api_key
    exit /b 1
)

echo.
echo 3. 检查服务文件...
if exist backend\app\services\gemini_service.py (
    echo    √ gemini_service.py 存在
) else (
    echo    × gemini_service.py 不存在
    exit /b 1
)

if exist backend\app\services\llm_factory.py (
    echo    √ llm_factory.py 存在
) else (
    echo    × llm_factory.py 不存在
    exit /b 1
)

echo.
echo 4. 检查 API 更新...
findstr /C:"model" backend\app\api\frameworks.py >nul
if %errorlevel% == 0 (
    echo    √ frameworks.py 支持 model 参数
) else (
    echo    × frameworks.py 不支持 model 参数
)

findstr /C:"model" backend\app\api\prompts.py >nul
if %errorlevel% == 0 (
    echo    √ prompts.py 支持 model 参数
) else (
    echo    × prompts.py 不支持 model 参数
)

echo.
echo =========================================
echo √ 所有检查通过！
echo =========================================
echo.
echo 下一步：
echo 1. 提交代码: git add . ^&^& git commit -m "feat: Gemini 集成" ^&^& git push
echo 2. 等待 Vercel 部署完成
echo 3. 清除浏览器缓存 (Ctrl+Shift+Delete)
echo 4. 访问 https://384866.xyz/test-model 验证
echo.
pause
