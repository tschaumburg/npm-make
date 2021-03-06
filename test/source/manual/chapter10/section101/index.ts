import * as fs from "fs";
import * as path from "path";
import * as mocha from "mocha";
import { multiTestcase, successFile } from "../../../fixtures"
import { simpleTest } from "../../../fixtures/testcases/simple-testcase";

import * as case1 from "./case1";
import * as case2 from "./case2";
import * as case3 from "./case3";

export function loadTests(baseDir: string): void
{
    var thisDir = path.resolve(baseDir, "section1");
    describe('10.1: ', function ()
    {
        case1.loadTests(thisDir);
        case2.loadTests(thisDir);
        case3.loadTests(thisDir);
    });
}
