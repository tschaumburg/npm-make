import * as log from './makelog';

export const COMMAND_UNKNOWN_GOAL = 106;
export function commandUnknownGoal(goalName: string)
{
    var msg = "Target " + goalName + " not defined in makefile";

    console.error(msg);
    log.fatal(msg);
    process.exit(COMMAND_UNKNOWN_GOAL);
}

export const PARSE_UNDEFINED_VARIABLE = 105;
export function parseUndefinedVariable(varname: string)
{
    var msg = "Undefined variable " + varname;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_UNDEFINED_VARIABLE);
}

export const PARSE_UNEXPECTED_EXCEPTION = 104;
export function parseUnexpectedException(details: string, line: string, lineNo: number)
{
    var msg = "Unexpected exception in line\n(" + lineNo + ") " + line + "\n" + details;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_UNEXPECTED_EXCEPTION);
}

export const PARSE_INCLUDE_FAILED = 103;
export function parseIncludeFailed(includedFile: string)
{
    var msg = "Error including file " + includedFile;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_INCLUDE_FAILED);
}

export const PARSE_NO_MATCH = 102;
export function parseNoMatch(line: string, lineNo: number)
{
    var msg = "Error parsing line (" + lineNo + ") " + line;

    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_NO_MATCH);
}

export const RULE_MISSING_TARGET = 101;
export function ruleMissingTarget()
{
    var msg = "Rule must contain at least one target";

    console.error(msg);
    log.fatal(msg);
    process.exit(RULE_MISSING_TARGET);
}

export const MAKEFILE_MISSING_TARGET = 107;
export function makefileMissingTarget()
{
    var msg = "Makefile must contain at least one target";

    console.error(msg);
    log.fatal(msg);
    process.exit(MAKEFILE_MISSING_TARGET);
}

export const RECIPE_EXECUTION_ERROR = 108;
export function recipeExecutionError(code: number, cmd: string)
{
    var msg = 'Command \"' + cmd + '\" failed with code ' + code;

    if (code < 0)
        code -= 200;

    console.error(msg);
    log.fatal(msg);
    process.exit(code);
}

export const RULE_UNKNOWN_TARGET = 109;
export function ruleUnknownTarget(targetName: string, fullname: string)
{
    var msg =
        "Target " + targetName +
        " (" + fullname + ")" +
        " does not exist, and there's no rule to build it";
    console.error(msg);
    log.fatal(msg);
    process.exit(RULE_UNKNOWN_TARGET);
}

export const PARSE_MULTIPLE_RULES_FOR_TARGET = 110;
export function parseMultipleRulesForTarget(targetName: string)
{
    var msg =
        "Target " + targetName +
        " has multiple build rules";
    console.error(msg);
    log.fatal(msg);
    process.exit(PARSE_MULTIPLE_RULES_FOR_TARGET);
}

export const ERROR_NO_MAKEFILE = 111;
export function errorNoMakefile(filename: string)
{
    var msg =
        "Cannot find makefile '" + filename +"'";
    console.error(msg);
    log.fatal(msg);
    process.exit(ERROR_NO_MAKEFILE);
}



//export const PARSE_ERROR = -100;
//export const MISSING_TARGET = -100;
//export const MISSING_TARGET = -100;

//export class MakeError
//{
//}