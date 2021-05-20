const fs = require('fs');
const config = require('./config.json');
const readline = require('readline');


async function editDocx(completeList, activeList){
    //Como os nomes no google classroom não são exatamente os mesmos da lista de alunos
    //É necessário um mapeamento para não ocorrer erros ao comparar as duas listas
    for(i = 0; i < activeList.length; i++){
        //Se o primeiro nome for igual, quer dizer que ela é a mesma pessoa
        //Já que a diferença de nomes está apenas na abreviação
        completeList.forEach(nome => {
            let firstNameA = activeList[i].split(" ")[0];
            let surnameA = activeList[i].split(" ")[activeList[i].split(" ").length - 1];
            let firstNameB =  nome.split(" ")[0];
            let surnameB = nome.split(" ")[nome.split(" ").length - 1];
            if(firstNameA === firstNameB && surnameA === surnameB){
                //Atualizar nome na lista de ativos
                activeList[i] = nome;
            }
        })
    }
    console.log(activeList)

    const pattern = /@\d+/g;
    let symbolList = [];
    //Criar um array com a quantidade das pessoas comparando se uma pessoa esta presente ou não
    completeList.forEach(i => {
        if(activeList.includes(i)){
            symbolList.push(true);
        }
        symbolList.push(false);
    });

    dict = {
        ['layout']: (num) => {

        }
    }
    let docx = fs.readFileSync(config.docxFile, 'utf8');
    let editedDocx = docx.replace(pattern, (match) => {
        match = match.slice(1);
        if(match <= completeList.length){
            return symbolList[match] ? "P" : "F";
        };
        return match;
    });

    fs.writeFileSync(`${config.docxPath}/eddited_document.xml`, editedDocx, (err) => {
        console.log("Error writing eddited file");
        console.log(err);
    })

}

//Pegar lista de alunos completa 
async function getCompleteList(){
    const file = fs.createReadStream('listaCompleta.txt');
    let list = [];
    var lineReader = readline.createInterface({
        input: file
    });

    lineReader.on('line', async line => {
        await list.push(line);
    });
    
    lineReader.on('close', () => {
        list = list.sort();
        getActive(list);
    })
}

//Lista de alunos ativos na sala de aula
async function getActive(completeList){
    const file = fs.createReadStream('presentes.txt');
    let list = [];
    var lineReader = readline.createInterface({
        input: file
    });

    lineReader.on('line', async line => {
        await list.push(line);
    });
    
    lineReader.on('close', () => {
        list = list.sort();
        editDocx(completeList, list);
    })
}

getCompleteList();

