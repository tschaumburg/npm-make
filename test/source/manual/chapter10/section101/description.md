## 10.1 Using Implicit Rules

To allow make to find a customary method for updating a target file, all you have to do is refrain from specifying recipes yourself. Either write a rule with no recipe, or don’t write a rule at all. Then make will figure out which implicit rule to use based on which kind of source file exists or can be made.

For example, suppose the makefile looks like this:

    foo : foo.o bar.o
        cc -o foo foo.o bar.o $(CFLAGS) $(LDFLAGS)

Because you mention foo.o but do not give a rule for it, make will automatically look for an implicit rule that tells how to update it. This happens whether or not the file foo.o currently exists.

If an implicit rule is found, it can supply both a recipe and one or more prerequisites (the source files). 

> ### Case 1a-d: Simple implicit rule 
> 
> ```makefile
>     %.intermediate: %.src
>           echo building $@ from $<
> ```
> 
> run the rule 
> 
> ```makefile
>    foo.target : foo.intermediate
>           echo building $@ from $<
> ```
> with the following combinations of foo.src and foo.intermediate:
>
> - **Case 1a:** no foo.o and no foo.testsrc => fail, 
> - **Case 1b:** foo.testsrc but no foo.o => build foo.o, 
> - **Case 1c:** foo.testsrc newer than foo.o => build foo.o,
> - **Case 1d:** foo.o newer than foo.testsrc => do nothing
>
> | Case | `foo.src` | `foo.intermediate` | Expected result
> | ---- | --------- | ------------------ | ---------------
> |  1a  |   none    |        none        | Error
> |  1b  |  present  |        none        | Build
> |  1c  |  newest   |       oldest       | Build
> |  1d  |  oldest   |       newest       | nothing

You would want to write a rule for foo.o with no recipe if you need to specify additional prerequisites, such as header files, that the implicit rule cannot supply.

> ### Test case 2 : Reusing the rules above, add the following
> 
> ```makefile
>    foo.o : common.h 
> ```
> 
> Case   | foo.o | foo.testsrc | common.h  | Expected
> ------ | ------ | ----------- | --------- | ------
> case2a |   -   |      -      |     -     | error
> case2b |   -   |      -      |   exists  | error
> case2c |   -   |   exists    |     -     | error
> case2d |   -   |   exists    |   exists  | build
> case2e |oldest |   middle    |   newest  | build
> case2f |oldest |   newest    |   middle  | build
> case2g |middle |   oldest    |   newest  | build
> case2h |middle |   newest    |   oldest  | build
> case2i |newest |   oldest    |   middle  | nothing
> case2j |newest |   middle    |   oldest  | nothing

Each implicit rule has a target pattern and prerequisite patterns. There may be many implicit rules with the same target pattern. For example, numerous rules make ‘.o’ files: one, from a ‘.c’ file with the C compiler; another, from a ‘.p’ file with the Pascal compiler; and so on. The rule that actually applies is the one whose prerequisites exist or can be made. So, if you have a file foo.c, make will run the C compiler; otherwise, if you have a file foo.p, make will run the Pascal compiler; and so on.

> ### Test case 3: Multiple implicit rules
>
> ```makefile
>     %.o: %.testsrc1
>         echo build from $<
> 
>     %.o: %.testsrc2
>         echo build from $<
> ```
> 
> Case   | foo.testsrc1 | foo.testsrc2 | Expected
> ------ | ------------ | ------------ | --------
> case3a |    exists    |      -       | build from testsrc1
> case3b |      -       |    exists    | build from testsrc2
> case3c |      -       |      -       | error
> case3d |    exists    |    exists    | build from ???

Of course, when you write the makefile, you know which implicit rule you want make to use, and you know it will choose that one because you know which possible prerequisite files are supposed to exist. See Catalogue of Built-In Rules, for a catalogue of all the predefined implicit rules.

Above, we said an implicit rule applies if the required prerequisites “exist or can be made”. A file “can be made” if it is mentioned explicitly in the makefile as a target or a prerequisite, or if an implicit rule can be recursively found for how to make it. When an implicit prerequisite is the result of another implicit rule, we say that chaining is occurring. See Chains of Implicit Rules.

In general, make searches for an implicit rule for each target, and for each double-colon rule, that has no recipe. A file that is mentioned only as a prerequisite is considered a target whose rule specifies nothing, so implicit rule search happens for it. See Implicit Rule Search Algorithm, for the details of how the search is done.

Note that explicit prerequisites do not influence implicit rule search. For example, consider this explicit rule:

    foo.o: foo.p

The prerequisite on foo.p does not necessarily mean that make will remake foo.o according to the implicit rule to make an object file, a .o file, from a Pascal source file, a .p file. For example, if foo.c also exists, the implicit rule to make an object file from a C source file is used instead, because it appears before the Pascal rule in the list of predefined implicit rules (see Catalogue of Built-In Rules).

If you do not want an implicit rule to be used for a target that has no recipe, you can give that target an empty recipe by writing a semicolon (see Defining Empty Recipes).

> ### Test case 4:
>
> **TBS**
