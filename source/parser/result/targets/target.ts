import { IParseLocation, IParseContext } from "../result-builder";

export abstract class Target
{
    constructor(
        public readonly location: IParseLocation, 
        public readonly parseContext: IParseContext, 
        public readonly basedir: string,
        public readonly relname: string
    ) {}
}

