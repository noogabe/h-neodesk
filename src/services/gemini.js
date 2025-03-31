const axios = require('axios');
require('dotenv').config();

class GeminiPromptService {
	constructor() {
		this.apiKey = process.env.GEMINI_API_KEY;
		this.model = process.env.GEMINI_MODEL;
        this.geminiUrl = process.env.GEMINI_URL;
		this.geminiTimeout = process.env.GEMINI_HTTP_TIMEOUT;
		this.endpoint = `${this.geminiUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
	}

	async execute(prompt) {
		try {
			const { data } = await axios.post(
				this.endpoint,
				{ contents: [{ parts: [{ text: prompt }] }] },
				{ timeout: this.geminiTimeout }
			);
			return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
		} catch (error) {
			console.error('Erro ao chamar a API do Gemini:', error.response?.data || error.message);
			throw new Error('Erro ao processar a solicitação do Gemini.');
		}
	}
}

module.exports = new GeminiPromptService();
