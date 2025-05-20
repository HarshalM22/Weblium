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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const inference_1 = require("@huggingface/inference");
if (!process.env.HF_TOKEN) {
    console.error("❌ HF_TOKEN not found in environment variables.");
    process.exit(1);
}
const client = new inference_1.InferenceClient(process.env.HF_TOKEN);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f;
        try {
            const out = yield client.chatCompletionStream({
                model: "meta-llama/Llama-3.1-8B-Instruct",
                max_tokens: 1024,
                temperature: 0, //randomness and exploration for reliable results
                messages: [
                    {
                        role: "user",
                        content: "what is the capital of india? ",
                    },
                ],
                stream: true,
            });
            console.log("💬 Assistant:");
            try {
                for (var _g = true, out_1 = __asyncValues(out), out_1_1; out_1_1 = yield out_1.next(), _a = out_1_1.done, !_a; _g = true) {
                    _c = out_1_1.value;
                    _g = false;
                    const chunk = _c;
                    const delta = (_f = (_e = (_d = chunk.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.delta) === null || _f === void 0 ? void 0 : _f.content;
                    if (delta) {
                        process.stdout.write(delta);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = out_1.return)) yield _b.call(out_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            console.log("\n✅ Done.");
        }
        catch (error) {
            console.error("❌ Error streaming response:", error);
        }
    });
}
main();
