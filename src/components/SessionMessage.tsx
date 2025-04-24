import {
  MessageQuestion,
  MessageSources,
  MessageResponse,
  MessageActions,
  SessionMessage,
  Conversation,
} from "reachat";
import { GraphVisualization } from "./GraphVisualization";
import { ConversationExt } from "../types/types";
import { upvoteHandler, downvoteHandler } from "../services/api.service";
import { FC } from "react";

interface Props {
  conversation: ConversationExt;
  isLast?: boolean; // Add any other props you need
}

export const SessionMessageCustom: FC<Props> = ({ conversation, isLast }) => {
  return (
    <SessionMessage
      key={conversation.id}
      conversation={conversation as Conversation}
      isLast={isLast}
    >
      <MessageQuestion
        question={conversation.question}
        files={conversation.files}
      />
      <div className="flex flex-col gap-4 py-6 rounded-3xl rounded-tr-none">
        <div className="flex flex-row gap-4 w-full pr-4">
          <div className="flex-1">
            {conversation.response === undefined ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="break-words overflow-wrap-anywhere">
                  <MessageResponse
                    response={conversation.response || "No answer can be found"}
                  />
                </div>
                <MessageSources sources={conversation.sources || []} />
              </>
            )}
          </div>

          {conversation.kg && (
            <div className="flex-1 min-w-[300px] h-[650px]">
              <GraphVisualization kg={conversation.kg} id={conversation.id} />
            </div>
          )}
        </div>
        <MessageActions
          question={conversation.question}
          response={conversation.response}
          onUpvote={() => {
             upvoteHandler(conversation.traceUrl)
          }}
          onDownvote={
            () => {
              downvoteHandler(conversation.traceUrl)
            }
          }
          onCopy={() => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(conversation.response || "")
                .then(() => {
                  // Optional: Add feedback to the user (e.g., show a toast notification)
                  console.log('Response copied to clipboard!');
                })
                .catch(err => {
                  // Handle potential errors (e.g., user denied permission, browser limitations)
                  console.error('Failed to copy text: ', err);
                });
            } else {
              // Fallback for older browsers or environments where clipboard API is not available
              console.warn('Clipboard API not supported.');
              // You could potentially implement a fallback using the older document.execCommand('copy') here,
              // but it's generally less reliable and has security considerations.
            }
          }}

        />
      </div>
    </SessionMessage>
  );
};
