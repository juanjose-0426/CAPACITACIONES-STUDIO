const { spawn } = require('child_process');
const path = require('path');

function runProcess(name, cwd, args) {
    const proc = spawn('npm', args, {
        cwd: path.join(__dirname, cwd),
        shell: true,
        stdio: 'inherit'
    });

    proc.on('error', (err) => {
        console.error(`[${name}] Error al iniciar:`, err);
    });

    return proc;
}

console.log('Iniciando Backend y Frontend...');
const backend = runProcess('BACKEND', 'backend', ['run', 'dev']);
const frontend = runProcess('FRONTEND', 'frontend', ['run', 'dev']);

process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit();
});

