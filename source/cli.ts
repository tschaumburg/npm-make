#!/usr/bin/env node
import * as log from './makelog';
import * as exits from './return-codes';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from "./parser";
import { plan, toTree } from "./execution";
import { Recipe } from "./parser/rule";
import { exists } from 'fs';
import { IMakefile } from './imakefile';
var program = require('commander');
var pkg = require("../package.json");

program
    .version(pkg.version)
    //.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
    //.option('-B, --always-make', 'Consider all targets out-of-date.GNU make proceeds to consider targets and their prerequisites using the normal algorithms; however, all targets so considered are always remade regardless of the status of their prerequisites.To avoid infinite recursion, if MAKE_RESTARTS(see Other Special Variables) is set to a number greater than 0 this option is disabled when considering whether to remake makefiles(see How Makefiles Are Remade).')
    //.option('--debug[= options]', 'Print debugging information in addition to normal processing.Various levels and types of output can be chosen.With no arguments, print the �basic� level of debugging.Possible arguments are below; only the first character is considered, and values must be comma-or space-separated.')
    //    a(all)
    //All types of debugging output are enabled.This is equivalent to using '-d'.

    //b(basic)
    //Basic debugging prints each target that was found to be out-of-date, and whether the build was successful or not.

    //    v(verbose)
    //A level above 'basic'; includes messages about which makefiles were parsed, prerequisites that did not need to be rebuilt, etc.This option also enables 'basic' messages.

    //    i(implicit)
    //Prints messages describing the implicit rule searches for each target.This option also enables 'basic' messages.

    //    j(jobs)
    //Prints messages giving details on the invocation of specific sub-commands.

    //    m(makefile)
    //By default, the above messages are not enabled while trying to remake the makefiles.This option enables messages while rebuilding makefiles, too.Note that the 'all' option does enable this option.This option also enables 'basic' messages.

    //    n(none)
    //Disable all debugging currently enabled.If additional debugging flags are encountered after this they will still take effect.
    //.option('-e, --environment-overrides', 'Give variables taken from the environment precedence over variables from makefiles.See Variables from the Environment.')
    //.option('--eval=string', 'Evaluate string as makefile syntax.This is a command-line version of the eval function (see Eval Function).The evaluation is performed after the default rules and variables have been defined, but before any makefiles are read.')
    //.option('-i, --ignore-errors', 'Ignore all errors in recipes executed to remake files.See Errors in Recipes.')
    //.option('-I dir, --include-dir=dir', 'Specifies a directory dir to search for included makefiles.See Including Other Makefiles.If several -I options are used to specify several directories, the directories are searched in the order specified.')
    //.option('-j[jobs], --jobs[= jobs]', 'Specifies the number of recipes(jobs) to run simultaneously.With no argument, make runs as many recipes simultaneously as possible.If there is more than one -j option, the last one is effective.See Parallel Execution, for more information on how recipes are run.Note that this option is ignored on MS-DOS.')
    //.option('-k, --keep-going', 'Continue as much as possible after an error.While the target that failed, and those that depend on it, cannot be remade, the other prerequisites of these targets can be processed all the same.See Testing the Compilation of a Program.')
    //.option('-l[load], --load-average[= load], --max-load[= load]', 'Specifies that no new recipes should be started if there are other recipes running and the load average is at least load(a floating-point number).With no argument, removes a previous load limit.See Parallel Execution.')
    //.option('-L, --check-symlink-times', 'On systems that support symbolic links, this option causes make to consider the timestamps on any symbolic links in addition to the timestamp on the file referenced by those links.When this option is provided, the most recent timestamp among the file and the symbolic links is taken as the modification time for this target file.')
    //.option('-o file, --old-file=file, --assume-old=file', 'Do not remake the file file even if it is older than its prerequisites, and do not remake anything on account of changes in file.Essentially the file is treated as very old and its rules are ignored.See Avoiding Recompilation of Some Files.')
    //.option('-O[type], --output-sync[= type]', 'Ensure that the complete output from each recipe is printed in one uninterrupted sequence.This option is only useful when using the--jobs option to run multiple recipes simultaneously(see Parallel Execution) Without this option output will be displayed as it is generated by the recipes.')

    //With no type or the type 'target', output from the entire recipe of each target is grouped together.With the type 'line', output from each line in the recipe is grouped together.With the type \'recurse\', the output from an entire recursive make is grouped together.With the type 'none', no output synchronization is performed.See Output During Parallel Execution.')

    //.option('-q, --question', '�Question mode�.Do not run any recipes, or print anything; just return an exit status that is zero if the specified targets are already up to date, one if any remaking is required, or two if an error is encountered.See Instead of Executing Recipes.')
    //.option('-r, --no-builtin-rules', 'Eliminate use of the built-in implicit rules(see Using Implicit Rules).You can still define your own by writing pattern rules(see Defining and Redefining Pattern Rules).The -r option also clears out the default list of suffixes for suffix rules(see Old-Fashioned Suffix Rules).But you can still define your own suffixes with a rule for .SUFFIXES, and then define your own suffix rules.Note that only rules are affected by the-r option; default variables remain in effect(see Variables Used by Implicit Rules); see the -R option below.')
    //.option('-R, --no-builtin-variables', 'Eliminate use of the built-in rule-specific variables(see Variables Used by Implicit Rules).You can still define your own, of course.The -R option also automatically enables the -r option(see above), since it doesn\'t make sense to have implicit rules without any definitions for the variables that they use.')
    //.option('-S, --no-keep-going, --stop', 'Cancel the effect of the -k option. This is never necessary except in a recursive make where -k might be inherited from the top-level make via MAKEFLAGS(see Recursive Use of make) or if you set -k in MAKEFLAGS in your environment.')
    //.option('-t, --touch', 'Touch files(mark them up to date without really changing them) instead of running their recipes.This is used to pretend that the recipes were done, in order to fool future invocations of make.See Instead of Executing Recipes.')
    //.option('--trace', 'Show tracing information for make execution. Prints the entire recipe to be executed, even for recipes that are normally silent(due to .SILENT or \'@\').Also prints the makefile name and line number where the recipe was defined, and information on why the target is being rebuilt.')
    //.option('-w, --print-directory', 'Print a message containing the working directory both before and after executing the makefile.This may be useful for tracking down errors from complicated nests of recursive make commands.See Recursive Use of make. (In practice, you rarely need to specify this option since 'make' does it for you; see The '--print - directory' Option.)')
    //.option('--no-print-directory', 'Disable printing of the working directory under -w. This option is useful when-w is turned on automatically, but you do not want to see the extra messages.See The --print-directory Option.')
    //.option('-W file, --what -if= file, --new- file=file, --assume-new=file', 'Pretend that the target file has just been modified.When used with the -n flag, this shows you what would happen if you were to modify that file. Without -n, it is almost the same as running a touch command on the given file before running make, except that the modification time is changed only in the imagination of make.See Instead of Executing Recipes.')
    //.option('--warn-undefined-variables', 'Issue a warning message whenever make sees a reference to an undefined variable.This can be helpful when you are trying to debug makefiles which use variables in complex ways.')
    .option('-C dir, --directory=dir', 'Change to directory dir before reading the makefiles.If multiple -C options are specified, each is interpreted relative to the previous one: -C / -C etc is equivalent to -C / etc. This is typically used with recursive invocations of make(see Recursive Use of make).')
    .option('-d', 'Print debugging information in addition to normal processing.The debugging information says which files are being considered for remaking, which file-times are being compared and with what results, which files actually need to be remade, which implicit rules are considered and which are applied�everything interesting about how make decides what to do.The-d option is equivalent to --debug = a (see below).')
    .option('-f file, --file=file, --makefile=file', 'Read the file named file as a makefile.See Writing Makefiles.')
    .option('-h, --help', 'Remind you of the options that make understands and then exit.')
    .option('-n, --just-print, --dry-run, --recon', 'Print the recipe that would be executed, but do not execute it(except in certain circumstances).See Instead of Executing Recipes.')
    .option('-p, --print-data-base', 'Print the data base(rules and variable values) that results from reading the makefiles; then execute as usual or as otherwise specified.This also prints the version information given by the -v switch (see below).To print the data base without trying to remake any files, use make -qp. To print the data base of predefined rules and variables, use make -p -f /dev/null.The data base output contains file name and line number information for recipe and variable definitions, so it can be a useful debugging tool in complex environments.')
    .option('-s, --silent, --quiet', 'Silent operation; do not print the recipes as they are executed.See Recipe Echoing.')
    .option('-v, --version', 'Print the version of the make program plus a copyright, a list of authors, and a notice that there is no warranty; then exit.')
    .parse(process.argv);

log.init();

let makefile: IMakefile = null;
do
{
    log.info("Parsing Makefile");
    makefile = parse("Makefile", { ignoreMissingIncludes: true }, process.env);

    //if (!makefile)
    //{
    //    exits.ruleMissingTarget();
    //}
} while (remakeMakefiles(makefile));

var targets = program.args;
if (targets.length == 0)
{
    if (!makefile.defaultTarget)
        exits.makefileMissingTarget();
    targets = [makefile.defaultTarget];
}

log.info("Making targets %j", targets);

var _plan = plan(makefile, targets);
_plan.run();
log.flush();

function remakeMakefiles(dependencyGraph: IMakefile): boolean
{
    var makefiles =
        makefile
            .makefileNames
            .map(name => dependencyGraph.findTarget(path.resolve('.', name)))
            .filter(target => target != null)
            .map(target => target.fullName);

    log.info("updating " + JSON.stringify(makefile.makefileNames));
    log.info("updating " + JSON.stringify(makefiles));

    var _plan =
        plan(
            dependencyGraph,
            makefiles
         );

    if (_plan.isEmpty())
        return false;

    _plan.run();

    return true;
}