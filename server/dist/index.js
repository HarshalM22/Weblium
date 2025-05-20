"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const inference_1 = require("@huggingface/inference");
const client = new inference_1.InferenceClient(process.env.HF_TOKEN);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const out = yield client.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            max_tokens: 512,
            temperature: 0, //randomness and exploration for reliable results
            messages: [{
                    role: "user",
                    content: "write a code for a simple TODO app"
                }],
        });
        console.log(out.choices[0].message.content);
    });
}
main();
