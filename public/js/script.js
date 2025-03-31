document.addEventListener("DOMContentLoaded", function () {
    const cfContext = document.getElementById("cf-context");
    const feedbackEl = document.createElement("div");
            feedbackEl.id = "upload-feedback";
            feedbackEl.style.fontSize = "12px";
            feedbackEl.style.color = "#555";
            feedbackEl.style.textAlign = "center";
            feedbackEl.style.display = "none";
            feedbackEl.textContent = "Nenhuma imagem anexada";
    
            document.addEventListener("change", function (event) {
        if (event.target && event.target.type === "file" && event.target.name === "anexo") {
            cfContext.parentNode.insertBefore(feedbackEl, cfContext.nextSibling);
            const files = event.target.files.length;
            feedbackEl.textContent = files === 1 ? `1 imagem anexada` : `${files} imagens anexadas`;
        }
    });

    const cf = window.cf.ConversationalForm.startTheConversation({
        formEl: document.getElementById("form"),
        context: cfContext,
        flowStepCallback: function (dto, success, error) {

            if (dto.tag.name === "anexo") {
                feedbackEl.style.display = "block";
              } else { 
                feedbackEl.style.display = "none";
              }

            if (dto.tag.name === "anexo") {
                const inputFile = document.querySelector('input[name="anexo"]');
                if (!inputFile.files.length) {
                    return error("Este campo é obrigatório!");
                }
            }

            if (dto.tag.name === "link") {
                const inputLink = document.querySelector('input[name="link"]');
                const linkValue = inputLink.value.trim();

                if (!linkValue) {
                    return error("Este campo é obrigatório!");
                }
                if (linkValue.length < 2) {
                    return error("Tamanho mínimo de 2 caracteres!");
                }
                if (linkValue.length > 300) {
                    return error("Tamanho máximo de 300 caracteres!");
                }
                inputLink.value = inputLink.value.trim().replace(/(\.com|\.br|\.net|\.org|\.gov|\.edu)(\/.*)?$/, "$1");
            }

            if (dto.tag.name === "descricao") {
                const inputDescricao = document.querySelector('input[name="descricao"]');
                const descricaoValue = inputDescricao.value.trim();

                if (!descricaoValue) {
                    return error("Este campo é obrigatório!");
                }
                if (descricaoValue.length < 20) {
                    return error("Tamanho mínimo de 20 caracteres!");
                }
                if (descricaoValue.length > 300) {
                    return error("Tamanho máximo de 300 caracteres!");
                }
            }

            success();
        },
        submitCallback: function () {
            cf.addRobotChatResponse(`Registrando sua solicitação...`);

            setTimeout(() => {
                const textarea = document.querySelector("textarea");
                if (textarea) {
                    textarea.removeAttribute("placeholder");
                }
            }, 100);

            const cfData = cf.getFormData();
            const formData = new FormData();
            cfData.forEach((value, key) => formData.append(key, value));

            const fileInput = document.querySelector('input[name="anexo"]');
            if (fileInput?.files.length) {
                Array.from(fileInput.files).forEach(file => {
                    formData.append("anexo[]", file, file.name);
                });
            }

            axios.post("/asana", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
                .then(response => {
                    if (response.data) {
                        console.log("Resposta do servidor:", response.data);
                        cf.addRobotChatResponse(`Obrigado! Seu relato foi registrado com ID ${response.data.tapID}. Nossa equipe irá analisar e entraremos em contato se precisarmos de mais informações.`);
                    }
                })
                .catch(error => {
                    console.error("Erro na comunicação com o servidor:", error);
                    cf.addRobotChatResponse("Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente mais tarde.");
                });
        }
    });
});
