const { app, BrowserWindow, globalShortcut } = require('electron')
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process')
const { edge } = require('edge')

const _PROF_NAME = ".tt_profile";

let win = null

/**
 * ウインドウ作成
 */
const createWindow = async () => {
    //指定したファイルを読み込む
    let data = null
    const homePath = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
    const profPath = path.join(homePath, _PROF_NAME);
    console.log(profPath);
    if (fs.existsSync(profPath) == false) {
        data = ""
        fs.writeFileSync(profPath, data);
    } else {
        data = fs.readFileSync(profPath, "utf-8");
    }

    // ウインドウとショートカット作成
    const wins = []
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
        const args = line.split(/\s/);
        if (args.length >= 2) {
            const key = args[0];
            const task = args[1];

            const hotKey = `Super+Alt+${key}`;

            if (/^http/.test(task)) {
                // Web 画面
                const win = new BrowserWindow({ width: 1024, height: 768 })
                win.loadURL(task)
                win.on('close', (event) => {
                    event.preventDefault()
                    // 消すだけ
                    win.hide()
                })
                globalShortcut.register(hotKey, () => {
                    for (const other of wins) {
                        other.hide();
                    }
                    win.show();
                })

                win.hide()
                wins.push(win);
            } else {
                // パス実行
                globalShortcut.register(hotKey, () => {

                    if (args.length == 2) {
                        // なんどもプロセス実行
                        exec(task);
                    } else {
                        // すでにアプリ起動中ならそのアプリを前に出すだけ
                        const fileName = path.basename(task);
                        const pName = fileName.replace(/\.[^/.]+$/, "");
                        "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\Roslyn\csi.exe"
                        edge.func(function () {
                            `
using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

public class StartUp
{
    [DllImport("user32.dll")]
    static extern int SetForegroundWindow(IntPtr hwnd);

    public async Task<object> Invoke(object input)
    {
        var processList = Process.GetProcesses();

        foreach (var p in processList)
        {
            if (p.ProcessName == Path.GetFileNameWithoutExtension("${pName}"))
            {
                Console.Write(p.ProcessName);
                SetForegroundWindow(p.MainWindowHandle);
                return null;
            }
        }

        Process.Start("${pName}");
        return null;
    }
}
                        `});
                        // asfw.SetForegroundWindow(pName);

                        // const winToSetOnTop = user32.FindWindowA(null, pName)
                        // console.log(winToSetOnTop);
                        // const foregroundHWnd = user32.GetForegroundWindow()
                        // const currentThreadId = kernel32.GetCurrentThreadId()
                        // const windowThreadProcessId = user32.GetWindowThreadProcessId(foregroundHWnd, null)
                        // const showWindow = user32.ShowWindow(winToSetOnTop, 9)
                        // const setWindowPos1 = user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3)
                        // const setWindowPos2 = user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3)
                        // const setForegroundWindow = user32.SetForegroundWindow(winToSetOnTop)
                        // const attachThreadInput = user32.AttachThreadInput(windowThreadProcessId, currentThreadId, 0)
                        // const setFocus = user32.SetFocus(winToSetOnTop)
                        // const setActiveWindow = user32.SetActiveWindow(winToSetOnTop)


                        // var processList = Process.GetProcesses();

                        // for (var p in processList) {
                        //     if (p.ProcessName == Path.GetFileNameWithoutExtension(_cmd)) {
                        //         Console.Write(p.ProcessName);
                        //         SetForegroundWindow(p.MainWindowHandle);
                        //         return;
                        //     }
                        // }

                        // Process.Start(_cmd);
                    }
                });
            }
        }
    }
}

app.on('ready', createWindow)
app.on('will-quit', () => {
    // ショートカットキー全解除
    globalShortcut.unregisterAll()
})