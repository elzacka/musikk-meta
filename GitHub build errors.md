Run cd frontend && yarn build:gh
vite v5.4.19 building for production...
transforming...
✓ 61 modules transformed.
x Build failed in 709ms
error during build:
[vite:esbuild] Transform failed with 4 errors:
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:322:10: ERROR: Unexpected closing "header" tag does not match opening "div" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:338:8: ERROR: Unexpected closing "div" tag does not match opening "header" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:363:0: ERROR: The character "}" is not valid inside a JSX element
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:366:0: ERROR: Unexpected end of file before a closing "div" tag
file: /home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:322:10

Unexpected closing "header" tag does not match opening "div" tag
320|              </Dialog>
321|            </div>
322|          </header>
   |            ^
323|  
324|          {/* Main Content */}

Unexpected closing "div" tag does not match opening "header" tag
336|            </ErrorBoundary>
337|          </main>
338|        </div>
   |          ^
339|  
340|        {/* Command Palette */}

The character "}" is not valid inside a JSX element
361|      </div>
362|    )
363|  }
   |  ^
364|  
365|  export default App

Unexpected end of file before a closing "div" tag
364|  
365|  export default App
366|  
   |  ^

    at failureErrorWithLog (/home/runner/work/musikk-meta/musikk-meta/frontend/.yarn/unplugged/esbuild-npm-0.21.5-d85dfbc965/node_modules/esbuild/lib/main.js:1472:15)
    at /home/runner/work/musikk-meta/musikk-meta/frontend/.yarn/unplugged/esbuild-npm-0.21.5-d85dfbc965/node_modules/esbuild/lib/main.js:755:50
    at responseCallbacks.<computed> (/home/runner/work/musikk-meta/musikk-meta/frontend/.yarn/unplugged/esbuild-npm-0.21.5-d85dfbc965/node_modules/esbuild/lib/main.js:622:9)
    at handleIncomingPacket (/home/runner/work/musikk-meta/musikk-meta/frontend/.yarn/unplugged/esbuild-npm-0.21.5-d85dfbc965/node_modules/esbuild/lib/main.js:677:12)
    at Socket.readFromStdout (/home/runner/work/musikk-meta/musikk-meta/frontend/.yarn/unplugged/esbuild-npm-0.21.5-d85dfbc965/node_modules/esbuild/lib/main.js:600:7)
    at Socket.emit (node:events:524:28)
    at addChunk (node:internal/streams/readable:561:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
    at Readable.push (node:internal/streams/readable:392:5)
    at Pipe.onStreamRead (node:internal/stream_base_commons:191:23)
Error: Process completed with exit code 1.
