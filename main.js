import ranges from './ranges.js';
import readline from 'readline';
import chalk from 'chalk';
import CoinKey from 'coinkey';
import walletsArray from './wallets.js';
import fs from 'fs';
import crypto from 'crypto';

const walletsSet = new Set(walletsArray);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let shouldStop = false;

let min, max = 0;

console.clear();
const art = `\x1b[38;2;250;128;114m
╔═════════════════════════════════════════════════════════╗
║\x1b[0m\x1b[36m   ____ _____ ____   ____ ___ ___ ____ ____ __     _____\x1b[0m\x1b[38;2;250;128;114m ║
║\x1b[0m\x1b[36m  | __ )_   _/ ___| |   _ \| | | ||__  |__  || |    |  __|\x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  |  _ \| | | /      |  _) | | | |  / /  / / | |    |  _| \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  | |_)| | | |___   |  __/| |_| | / /_ /_/_ | |___ | |__ \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  |____/ |_|\_____|  |_|   |_____|/____|____||_____||____|\x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m                                                        \x1b[0m\x1b[38;2;250;128;114m ║
╚═══\x1b[38m═════════════ by:DiegoDev - RANDOM V2.1 ═══════════\x1b[0m\x1b[38;2;250;128;114m═══╝\x1b[0m`;
console.log(art);
console.log(`           ${chalk.bgRed('IG: @felip.codes | github/diegosales30')}`);

rl.question(`${chalk.yellowBright('SELECIONE UM PUZZLE ENTRE')} ${chalk.cyan(1)} - ${chalk.cyan(160)}: `, (answer) => {
    if (parseInt(answer) < 1 || parseInt(answer) > 160) {
        console.log(chalk.bgRed('Erro: você precisa escolher um número entre 1 e 160'));
    } else {
        min = BigInt(ranges[answer - 1].min);
        max = BigInt(ranges[answer - 1].max);
        console.log('Puzzle escolhido:', chalk.cyan(answer));
        console.log('Chaves possíveis:', chalk.yellow((max - min).toLocaleString('pt-BR')));

        rl.question(`${chalk.yellowBright(`SELECIONE O MODO (${chalk.green('1')} para Random, ${chalk.green('2')} para Random/Percentual, ${chalk.green('3')} para Sequencial/Percentual):`)}`, (mode) => {
            if (mode.toLowerCase() === '1') {
                iniciarBusca(min, max);
            } else if (mode.toLowerCase() === '2') {
                rl.question(`${chalk.yellowBright('DIGITE A % ENTRE 1 E 99: ')}`, (percent) => {
                    let percentage = parseInt(percent);
                    if (percentage < 1 || percentage > 99) {
                        console.log(chalk.bgRed('Erro: você precisa escolher uma porcentagem entre 1 e 99'));
                    } else {
                        let startValue = min + (max - min) * BigInt(percentage) / BigInt(100);
                        console.log(`Valor mínimo ajustado para: ${chalk.green(`0x...${startValue.toString(16)}`)}`);
                        iniciarBusca(startValue, max);
                    }
                });
            } else if (mode.toLowerCase() === '3') {
                rl.question(`${chalk.yellowBright('DIGITE A % ENTRE 1 E 99: ')}`, (percent) => {
                    let percentage = parseInt(percent);
                    if (percentage < 1 || percentage > 99) {
                        console.log(chalk.bgRed('Erro: você precisa escolher uma porcentagem entre 1 e 99'));
                    } else {
                        let startValue = min + (max - min) * BigInt(percentage) / BigInt(100);
                        console.log(`Valor mínimo ajustado para: ${chalk.green(`0x...${startValue.toString(16)}`)}`);
                        iniciarBuscaSequencial(startValue, max);
                    }
                });
            } else {
                console.log('Opção inválida. Operação cancelada.');
                rl.close();
            }
        });
    }
});

rl.on('SIGINT', () => {
    shouldStop = true;
    rl.close();
    process.exit();
});

process.on('SIGINT', () => {
    shouldStop = true;
    rl.close();
    process.exit();
});

function iniciarBusca(min, max) {
    rl.question(`DIGITE ${chalk.cyan('Y')} PARA INICIAR:`, (answer1) => {
        if (answer1.toLowerCase() === 'y') {
            encontrarBitcoins(min, max, shouldStop);
            rl.close();
        } else {
            console.log('Operação cancelada ou valor inválido!');
            console.log('CTRL + C para recomeçar.');
            rl.close();
        }
    });
}

function iniciarBuscaSequencial(start, max) {
    rl.question(`DIGITE ${chalk.cyan('Y')} PARA INICIAR:`, (answer1) => {
        if (answer1.toLowerCase() === 'y') {
            encontrarBitcoinsSequencial(start, max, shouldStop);
            rl.close();
        } else {
            console.log('Operação cancelada ou valor inválido!');
            console.log('CTRL + C para recomeçar.');
            rl.close();
        }
    });
}

function getRandomPrivateKey(min, max) {
    const range = max - min;
    const randomOffset = BigInt('0x' + crypto.randomBytes(16).toString('hex')) % range;
    return min + randomOffset;
}

async function encontrarBitcoins(min, max, shouldStop) {
    const startTime = Date.now();

    console.log('Buscando Bitcoins...');

    const executeLoop = async () => {
        while (!shouldStop) {
            const key = getRandomPrivateKey(min, max);
            let pkey = key.toString(16).padStart(64, '0');

            console.log(`${chalk.yellow('Searching Keys:')} ${chalk.green(pkey)}`);

            let publicKey = generatePublic(pkey);
            if (walletsSet.has(publicKey)) {
                const tempo = (Date.now() - startTime) / 1000;
                console.log(`
                    Velocidade: ${chalk.yellow(Number(key - min) / tempo)} 
                    Tempo: ${chalk.yellow(tempo)} segundos`);
                console.log(`
                    ╔════════════════════════════════════════════════════════════════════════╗
                    ║ CHAVE PRIVADA ENCONTRADA:                                              ║
                    ║ ${chalk.yellow(pkey)}       ║
                    ║ WIF: ${chalk.yellow(generateWIF(pkey))}              ║
                    ╚════════════════════════════════════════════════════════════════════════╝`);
                const filePath = 'keys.txt';
                const lineToAppend = `Private key: ${pkey}, WIF: ${generateWIF(pkey)}\n`;

                try {
                    fs.appendFileSync(filePath, lineToAppend);
                    console.log(`
                    Chave salva no arquivo ${chalk.yellow('keys.txt')}`); 
                } catch (err) {
                    console.error('Erro ao escrever chave em arquivo:', err);
                }

                shouldStop = true;
            }

            await new Promise(resolve => setImmediate(resolve));
        }
    };
    await executeLoop();
}

async function encontrarBitcoinsSequencial(start, max, shouldStop) {
    const startTime = Date.now();

    console.log('Buscando Bitcoins...');

    const executeLoop = async () => {
        let key = start;
        while (!shouldStop && key <= max) {
            let pkey = key.toString(16).padStart(64, '0');

            console.log(`${chalk.yellow('Searching Keys:')} ${chalk.green(pkey)}`);

            let publicKey = generatePublic(pkey);
            if (walletsSet.has(publicKey)) {
                const tempo = (Date.now() - startTime) / 1000;
                console.log(`
                    Velocidade: ${chalk.yellow(Number(key - min) / tempo)} 
                    Tempo: ${chalk.yellow(tempo)} segundos`);
                console.log(`
                    ╔════════════════════════════════════════════════════════════════════════╗
                    ║ CHAVE PRIVADA ENCONTRADA:                                              ║
                    ║ ${chalk.yellow(pkey)}       ║
                    ║ WIF: ${chalk.yellow(generateWIF(pkey))}              ║
                    ╚════════════════════════════════════════════════════════════════════════╝`);
                const filePath = 'keys.txt';
                const lineToAppend = `Private key: ${pkey}, WIF: ${generateWIF(pkey)}\n`;

                try {
                    fs.appendFileSync(filePath, lineToAppend);
                    console.log(`
                    Chave salva no arquivo ${chalk.yellow('keys.txt')}`); 
                } catch (err) {
                    console.error('Erro ao escrever chave em arquivo:', err);
                }

                shouldStop = true;
            }

            key++;
            await new Promise(resolve => setImmediate(resolve));
        }
    };
    await executeLoop();
}

function generatePublic(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    _key.compressed = true;
    return _key.publicAddress;
}

function generateWIF(privateKey) {
    let _key = new CoinKey(Buffer.from(privateKey, 'hex'));
    return _key.privateWif;
}

export default encontrarBitcoins;
