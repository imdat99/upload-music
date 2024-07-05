import { exec } from "child_process";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const killProcess = () => {
    const listCommands = [
        "pkill -f chrome",
        "pkill -f chromium",
        "pkill -f firefox",
        "pkill -f geckodriver",
        "pkill -f chromedriver",
        "pkill -9 chrome",
        "pkill -9 chromium",
        "pkill -9 firefox",
        "pkill -9 geckodriver",
        "pkill -9 chromedriver",
        "killall -9 chrome",
        "killall -9 chromium",
        "killall -9 firefox",
        "killall -9 geckodriver",
        "killall -9 chromedriver",
        "pkill -9 Xvfb",
        "killall -9 Xvfb",
        "echo \"kill all\"",
    ];
    for (let command of listCommands) {
        exec(command, function (error, stdout, stderr) {
            if (command === listCommands.at(-1)) {
                process.exit(1);
            }
        });

    }
};