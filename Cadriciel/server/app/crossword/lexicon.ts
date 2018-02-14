import { Request, Response } from "express";
import "reflect-metadata";
import { injectable, } from "inversify";
import * as requestPromise from "request-promise-native";
import { Difficulty } from "../../../common/crossword/difficulty";
import { ResponseWordFromAPI } from "../../../common/communication/responseWordFromAPI";

@injectable()
export class Lexicon {

    private readonly BASE_URL: string = "https://api.datamuse.com/words?";
    private difficulty: Difficulty = Difficulty.Easy;
    private readonly FREQUENCY_DELIMITER: number = 5;
    private readonly MIN_NUMBER_OF_DEFINITION: number = 2;
    private readonly UNWANTED_CHARACTERS_LENGTH: number = 2;
    private readonly ERROR_STATUS_CODE_LENGTH: number = 3;

    private getDefinition(word: string): string {
        const definitions: string = word["defs"];
        if (definitions === undefined || definitions === "") {
            return "";
        }

        for (let i: number = word["defs"].length - 1; i >= 0; i--) {
            let counter: number = word["defs"].length;
            // s'assurer que le mot ne soit ni un adverbe ni un adjectif
            if (definitions[i][0] === "a") {
                word["defs"].splice(i, 1);
                counter--;
                if (counter === 0) {
                    return "";
                }
            }
        }

        if (this.difficulty === Difficulty.Easy) {
            return definitions[0];
        } else {
            if (definitions.length >= this.MIN_NUMBER_OF_DEFINITION) {
                return definitions[1];
            } else {
                return definitions[0];
            }
        }
    }

    private checkFrequency(word: string): boolean {
        const frequency: number = word["tags"][0].substring(this.UNWANTED_CHARACTERS_LENGTH);
        if (this.difficulty === Difficulty.Hard) {
            if (frequency < this.FREQUENCY_DELIMITER) {
                return true;
            } else {
                return false;
            }
        } else {
            if (frequency >= this.FREQUENCY_DELIMITER) {
                return true;
            } else {
                return false;
            }
        }
    }

    private removeAccent(word: string): string {
        word = word.replace(new RegExp(/[àáâä]/gi), "A");
        word = word.replace(new RegExp(/ç/gi), "C");
        word = word.replace(new RegExp(/[èéêë]/gi), "E");
        word = word.replace(new RegExp(/[ìíîï]/gi), "I");
        word = word.replace(new RegExp(/[òóôö]/gi), "O");
        word = word.replace(new RegExp(/[ùúûü]/gi), "U");

        return word;
    }

    private removeSpecialCharacters(word: string): string {
        // delete non word characters (hyphens, apostrophes, etc.)
        word = word.replace(new RegExp(/\W/gi), "");

        return word;
    }

    private checkWordValidity(responseWord: ResponseWordFromAPI, randomWordFromList: string): boolean {
        if (this.checkFrequency(randomWordFromList)) {
            responseWord.definition = this.getDefinition(randomWordFromList);
            if (responseWord.definition !== "") {
                return false;
            }
        }

        return true;
    }

    private getValidWordFromList(words: string[]): ResponseWordFromAPI {
        let responseWord: ResponseWordFromAPI = new ResponseWordFromAPI();
        let isBadWord: boolean;
        do {
            isBadWord = true;
            const random: number = Math.floor(Math.random() * words.length);
            const randomWordFromList: string = words[random];
            responseWord.word = randomWordFromList["word"].toUpperCase();

            isBadWord = this.checkWordValidity(responseWord, randomWordFromList);

            if (isBadWord) {
                responseWord = new ResponseWordFromAPI();
                words.splice(words.findIndex((word: string) => word === randomWordFromList), 1);
                if (words.length === 0) {
                    isBadWord = false;
                }
            }

        } while (isBadWord);
        responseWord.word = this.removeSpecialCharacters(this.removeAccent(responseWord.word));

        return responseWord;
    }

    public getWordFromConstraint(req: Request, res: Response): void {
        this.difficulty = req.params.difficulty.toUpperCase();
        requestPromise(this.BASE_URL + "sp=" + this.removeAccent(req.params.constraints) + "&md=fd").then(
            (result: string) => {
                const words: string[] = JSON.parse(result.toString());
                if (words === undefined || words.length === 0) {
                    res.send(new ResponseWordFromAPI());
                } else {
                    res.send(this.getValidWordFromList(words));
                }
            }
        ).catch((e: Error) => {
            const status: number = +e.message.substring(0, this.ERROR_STATUS_CODE_LENGTH);
            res.sendStatus(status);
        });
    }
}
