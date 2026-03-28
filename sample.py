@socketio.on("chat")
def handle_chat(data):
    sid = request.sid

    query = data.get("query")
    filename = data.get("filename")
    message_id = data.get("messageId")

    callback = SocketIOCallbackHandler(socketio, sid, message_id)

    for event in graph.stream(
        {
            "query": query,
            "filename": filename,
            "messageId": message_id
        },
        config={"callbacks": [callback]}
    ):
        for node, output in event.items():

            # 🚨 Handle sanity failure
            if node == "sanity":
                if not output.get("is_valid") or not output.get("is_relevant"):
                    
                    # socketio.emit(
                    #     "node_update",
                    #     {
                    #         "messageId": message_id,
                    #         "node": "doc_answer",
                    #         "data": {
                    #             "documentAnswer":
                    #             "⚠️ This question seems unrelated to the document. Please ask something relevant."
                    #         }
                    #     },
                    #     room=sid
                    # )

            else:
                socketio.emit(
                    "node_update",
                    {
                        "messageId": message_id,
                        "node": node,
                        "data": output
                    },
                    room=sid
                )

    socketio.emit(
        "done",
        {"messageId": message_id},
        room=sid
    )