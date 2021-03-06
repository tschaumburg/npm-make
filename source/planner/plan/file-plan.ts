import { IFileRef } from "./file-ref";
import { IAction } from "./action";
import { IVirtualPath } from "./virtual-path";

export interface IFilePlan {
    readonly file: IFileRef;
    readonly producedBy: IAction;

    // After processing the prerequisites, the target 
    // may or may not need to be rebuilt:
    // 
    //   1. If the target [this IFilePlan object] does 
    //      not need to be rebuilt, the path to the file
    //      found during directory search [the vpath property]
    //      is used for any prerequisite lists which contain
    //      this target.
    //
    //      In short, if make doesn’t need to rebuild the
    //      target then you use the path found via directory
    //      search.
    //
    //   2. If the target does need to be rebuilt (is out-of
    //      -date), the pathname found during directory search
    //      is thrown away [disregarded], and the target is
    //      rebuilt using the file name specified in the makefile
    //      [the 'file' property].
    //
    //      In short, if make must rebuild, then the target is
    //      rebuilt locally, not in the directory found via
    //      directory search.
    //
    readonly vpath: string //IVirtualPath;
}
