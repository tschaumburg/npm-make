export function trimVarname(src: any)
{
    let res = src;                        // ' myvar ::= '
    //res = res.replace(/^[\s]*/, "");      // => 'myvar ::= '

    res = res.replace(/[:][:][=]$/, ""); // => 'myvar'
    res = res.replace(/[:?!+]?[=]$/, "");
    res = res.trim()

    return res;
}

export function trimVarvalue(src: any)
{
    //console.error("VAL " + src);
    var res = src.replace(/^[\s]*/, "").replace(/[ \r\n]*$/, "");
    //console.error("RES " + res);
    return res;
}

export function findUnescaped(src: string, find: string): number
{
    var escaped = false;

    for (var n = 0; n <  src.length; n++)
    {
        var c = src[n];

        if (c==="\\")
            escaped = !escaped;

        if (!escaped && c === find)
            return n;
    }

    return -1;
}

export function parseTargetList(src: string): (string|{prefix: string; suffix:string})[]
{
    return null;
}