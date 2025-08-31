Run cd frontend && yarn build:gh
vite v5.4.19 building for production...
transforming...
✓ 56 modules transformed.
x Build failed in 752ms
error during build:
[vite:esbuild] Transform failed with 7 errors:
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:258:20: ERROR: Unexpected closing "div" tag does not match opening "ScrollArea" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:259:18: ERROR: Unexpected closing "ScrollArea" tag does not match opening "DialogContent" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:260:16: ERROR: Unexpected closing "DialogContent" tag does not match opening "Dialog" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:261:14: ERROR: Unexpected closing "Dialog" tag does not match opening "div" tag
/home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:262:12: ERROR: Unexpected closing "div" tag does not match opening "header" tag
...
file: /home/runner/work/musikk-meta/musikk-meta/frontend/src/App.tsx:258:20

Unexpected closing "div" tag does not match opening "ScrollArea" tag
256|                        </p>
257|                      </div>
258|                    </div>
   |                      ^
259|                  </ScrollArea>
260|                </DialogContent>

Unexpected closing "ScrollArea" tag does not match opening "DialogContent" tag
257|                      </div>
258|                    </div>
259|                  </ScrollArea>
   |                    ^
260|                </DialogContent>
261|              </Dialog>

Unexpected closing "DialogContent" tag does not match opening "Dialog" tag
258|                    </div>
259|                  </ScrollArea>
260|                </DialogContent>
   |                  ^
261|              </Dialog>
262|            </div>

Unexpected closing "Dialog" tag does not match opening "div" tag
259|                  </ScrollArea>
260|                </DialogContent>
261|              </Dialog>
   |                ^
262|            </div>
263|          </header>

Unexpected closing "div" tag does not match opening "header" tag
260|                </DialogContent>
261|              </Dialog>
262|            </div>
   |              ^
263|          </header>
264|  

Unexpected closing "header" tag does not match opening "div" tag
261|              </Dialog>
262|            </div>
263|          </header>
   |            ^
264|  
265|          {/* Main Content */}

Expected ")" but found "{"
279|        </div>
280|  
281|        {/* Command Palette */}
   |        ^
282|        <Suspense fallback={null}>
283|          <CommandPalette

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