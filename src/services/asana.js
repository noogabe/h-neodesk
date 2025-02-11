const axios = require('axios');
require('dotenv').config();
const uploadFile = require('./upload-file');

const token = process.env.ASANA_ACCESS_TOKEN;
const workspaceId = process.env.ASANA_WORKSPACE_ID;
const projectId = process.env.ASANA_PROJECT_ID;
const assigneeId = process.env.ASANA_ASSIGNEE_ID;

function generateTAPID() {
    return "TAP" + Math.floor(100000 + Math.random() * 900000);
}

async function sendToAsana(formJsonData) {
    try {
        const tapID = generateTAPID();
        console.log("Dados recebidos no asana.js:", formJsonData);

        if (!formJsonData.link || !formJsonData.tipo || !formJsonData.impacto || !formJsonData.email || !formJsonData.gestor) {
            throw new Error("Dados incompletos no formData");
        }

        const taskData = {
            data: {
                workspace: workspaceId,
                assignee: assigneeId,
                projects: projectId,
                name: `Novo TAP: ${tapID}`,
                notes: `*Link: ${formJsonData.link}\n*Tipo: ${formJsonData.tipo}\n${"*Descrição: " + formJsonData.descricao || ""}\n*Impacto: ${formJsonData.impacto}\n*E-mail: ${formJsonData.email}\n*Gestor Imediato: ${formJsonData.gestor}\n*TAP ID: ${tapID}`
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

        if (formJsonData.anexo) {
            console.log("Arquivo de anexo encontrado:", formJsonData.anexo.name);
            const uploadResponse = await uploadFile(formJsonData.anexo, taskId);
            console.log("Arquivo anexado com sucesso:", uploadResponse.data);
        }

        return { data: taskResponse.data, tapID };

    } catch (error) {
        console.error("Erro ao criar tarefa no Asana:", error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = sendToAsana;
