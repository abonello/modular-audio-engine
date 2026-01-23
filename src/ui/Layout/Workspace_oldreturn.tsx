<main className="workspace">
      <div className="nodeRow">
        {/* {Array.from({ length: oscCount }).map((_, i) => (
          <div key={i} className="node osc">
            OSC {i + 1} (220Hz)
          </div>
        ))} */}

        {/* <div className="node gain">
          GAIN → OUTPUT
        </div> */}

        {/* {Array.from({ length: nodeCount }).map((_, i) => (
          <div key={i} className="node">
            NODE {i + 1}
          </div> */}
        {/* ))} */}

        {/* {nodes.map((node) => ( */}
        {patch.nodes.map((node) => (
          // <div key={node.id} className={`node ${node.kind}`}>
          //   {node.kind === "osc" ? "OSC" : "GAIN"}
          // </div>
          node ? (
            // <div
            //   key={node.id}
            //   className={`node ${node.kind} ${selectedNodeId === node.id ? "selected" : ""}`}
            //   onClick={() => setSelectedNodeId(node.id)}
            // >
            //   {node.kind === "osc" ? "OSC" : "GAIN"}
            // </div>
            <Draggable
              key={node.id}
              position={{ x: node.x ?? 0, y: node.y ?? 0 }}
              onStop={(e, data) => {
                setPatch(prev => ({
                  ...prev,
                  nodes: prev.nodes.map(n =>
                    n.id === node.id
                      ? { ...n, x: data.x, y: data.y }
                      : n
                  ),
                }));
              }}
            >
              <div
                // className={`node ${node.kind}`}
                className={`node ${node.type}`}
                onClick={() => setSelectedNodeId(node.id)}
                >
                {node.type.toUpperCase()}
                {/* {node.kind.toUpperCase()} */}
              </div>
            </Draggable>
          ) : null
        ))}
      </div>

      {children}

      {/* <div className="testControls"> */}
        <button onClick={handlePlay}>Play</button>
      {/* </div> */}
    </main>