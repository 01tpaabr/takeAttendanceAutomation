const pptr = require('puppeteer-core');
const fs = require('fs');
const config = require('./config.json');

//Url da reunião
const url = config.url;

(async () => {
    const browser = await pptr.launch({
        headless: false,
        executablePath: config.executablePath,
        userDataDir: config.userData
    })

    //Entrar no link, esperar 2 seg para carregar botões
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(2000);

    //Clica no botão para entrar na reunião
    await page.evaluate(async () => {
        await document.querySelectorAll("span").forEach(async element => {
            if(element.innerText == "Participar agora"){
                await element.click();
                return 0;
            }
        });
    })

    //Esperar página da reunião carregar
    await page.waitFor(2000);

    //Abrir lista de participantes
    await page.keyboard.down('ControlLeft');
    await page.keyboard.down('AltLeft');
    await page.keyboard.press('KeyP');

    await page.keyboard.up('ControlLeft');
    await page.keyboard.up('AltLeft');



    //Esperar atualização da página
    await page.waitFor(5000);

    //Pegar lista de presentes
    //https://stackoverflow.com/questions/57570538/how-do-i-return-a-value-from-page-evaluate-in-puppeteer
    const names = async () => {
            return await page.evaluate(async () => {
                let namesList = [];
                //Pegar o array de pessoas,  tirar professores e ordenar
                document.querySelectorAll('[role="listitem"]').forEach(async element => {
                    namesList.push(element.innerText);
                });

                return await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(namesList);
                    }, 3000);
                });
        })
    }

    let result = await names();

    
    for(i = 1; i < result.length; i++){
        await fs.appendFile("./alunos.txt", `${result[i]} \n`, (err) => {
            console.log(err);
        }); 
    }
    
})();