const axios = require('axios');
require('dotenv').config();
const uploadFile = require('./upload-file');
const geminiService = require('./gemini');

const token = process.env.ASANA_ACCESS_TOKEN;
const projectId = process.env.ASANA_PROJECT_ID;

function generateTAPID() {
    return "TAP" + Math.floor(100000 + Math.random() * 900000);
}

async function sendToAsana(formJsonData) {
    try {
        const tapID = generateTAPID();
        console.log("Dados recebidos no asana.js:", formJsonData);

        const taskStr = `Link ou nome do sistema: ${formJsonData.link}\nDescrição: ${formJsonData.descricao}\nTipo: ${formJsonData.tipo}`;

        const geminiResponse = await geminiService.execute(`Crie um título para essa tarefa com base nessas informações: ${taskStr}. Devolva apenas o título, sem nenhuma outra informação.`);

        if (!geminiResponse) {
            throw new Error("Não foi possível gerar o nome da tarefa.");
        }

        if (!formJsonData.link || !formJsonData.tipo || !formJsonData.descricao ||!formJsonData.impacto || !formJsonData.email || !formJsonData.gestor) {
            throw new Error("Dados incompletos no formData");
        }

        const taskData = {
            data: {
                projects: projectId,
                name: `Novo TAP: ${geminiResponse}`,
                notes: formJsonData.descricao,
                custom_fields: {
                    "1209280512501764": tapID,
                    "1209389467800059": formJsonData.link,
                    "1209265702520452": formJsonData.tipo,
                    "1209465592565001": formJsonData.frequencia,
                    "1209265702520458": formJsonData.impacto,
                    "1209228904499048": formJsonData.email,
                    "1209309153842443": formJsonData.gestor,
                  }
            }
        };

        console.log("Enviando payload para o Asana:", taskData);

        const taskResponse = await axios.post(
            "https://app.asana.com/api/1.0/tasks",
            taskData,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const taskId = taskResponse.data.data.gid;
        console.log("Tarefa criada com sucesso:", taskResponse.data);

        if (formJsonData.anexo && formJsonData.anexo.length > 0) {
            console.log("Arquivos de anexo encontrados:", formJsonData.anexo.map(file => file.name));
            
            for (const file of formJsonData.anexo) {
                const uploadResponse = await uploadFile(file, taskId);
                console.log("Arquivo anexado com sucesso:", uploadResponse.data);
            }
        }

        return { data: taskResponse.data, tapID };

    } catch (error) {
        console.error("Erro ao criar tarefa no Asana:", error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = sendToAsana;
