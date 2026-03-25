import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import chatApi from '../chat/chatApi';
import { mapBackendErrorToChatMessage } from '../chat/errorMapper';
import { ACTION_LABELS, executeSuggestedAction } from '../chat/actionRouter';
import {
  applyBusinessStatePatch,
  createInitialChatState,
  syncStateWithApp,
} from '../chat/chatState';

const ALLOWED_ACTIONS = [
  'CONNECT_STORE',
  'SHOW_PRODUCTS',
  'SCAN_BARCODE',
  'ADD_TO_CART',
  'VIEW_CART',
  'REMOVE_ITEM',
  'CHECKOUT',
  'SHOW_BILL',
  'VERIFY_EXIT',
];
const DEFAULT_QUICK_ACTIONS = ['CONNECT_STORE', 'SHOW_PRODUCTS', 'VIEW_CART', 'CHECKOUT', 'SHOW_BILL'];

const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatWidget = () => {
  const navigate = useNavigate();
  const { userId, storeId, setCartCount, connectToStore, cartCount } = useApp();

  const seedContext = useMemo(
    () => createInitialChatState({ userId, storeId, cartItemsCount: cartCount }),
    [userId, storeId, cartCount]
  );

  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [working, setWorking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hi, I am your SkipQ assistant. Tell me what you want to do and I will guide you step by step.',
      at: new Date(),
    },
  ]);
  const [context, setContext] = useState(seedContext);
  const [suggestedActions, setSuggestedActions] = useState(DEFAULT_QUICK_ACTIONS);
  const [pendingAction, setPendingAction] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [assistMeta, setAssistMeta] = useState({ nextStep: '', source: '' });

  useEffect(() => {
    setContext((prev) => syncStateWithApp(prev, { userId, storeId, cartItemsCount: cartCount }));
  }, [userId, storeId, cartCount]);

  const appendMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.floor(Math.random() * 1000), role, text, at: new Date() },
    ]);
  };

  const applyStatePatch = (patch) => {
    setContext((prev) => {
      const next = applyBusinessStatePatch(prev, patch);
      if (next.storeId && next.storeConnected) {
        connectToStore(next.storeId, '');
      }
      if (typeof next.cartItemsCount === 'number') {
        setCartCount(next.cartItemsCount);
      }
      return next;
    });
  };

  const runAction = async (action, sourceMessage) => {
    setWorking(true);
    setPendingAction(null);
    try {
      const result = await executeSuggestedAction({
        action,
        state: context,
        api: chatApi,
        messageText: sourceMessage || lastUserMessage,
      });

      applyStatePatch(result.statePatch || {});

      appendMessage('bot', result.reply);

      if (result.navigateTo) {
        navigate(result.navigateTo);
      }
    } catch (error) {
      appendMessage('bot', mapBackendErrorToChatMessage(error, 'I could not run that action right now.'));
    } finally {
      setWorking(false);
    }
  };

  const handleSend = async (rawText) => {
    const text = rawText.trim();
    if (!text || working) return;

    appendMessage('user', text);
    setLastUserMessage(text);
    setInput('');
    setWorking(true);

    try {
      const assist = await chatApi.assist({
        userId: context.userId,
        message: text,
        storeId: context.storeId,
        storeConnected: context.storeConnected,
        cartItemsCount: context.cartItemsCount,
        lastOrderId: context.lastOrderId,
      });

      appendMessage('bot', assist.reply);
      setAssistMeta({ nextStep: assist.nextStep, source: assist.source });

      const sanitizedActions = Array.isArray(assist.suggestedActions)
        ? assist.suggestedActions.filter((action) => ALLOWED_ACTIONS.includes(action))
        : [];

      const nextActions = sanitizedActions.length
        ? sanitizedActions
        : DEFAULT_QUICK_ACTIONS;
      setSuggestedActions(nextActions);
      setPendingAction(nextActions[0] || null);
    } catch (error) {
      appendMessage('bot', mapBackendErrorToChatMessage(error, 'Chat assistant is unavailable. Try a quick action instead.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="chat-widget-wrap" aria-live="polite">
      {expanded && (
        <section className="chat-widget-panel shadow-lg" aria-label="SkipQ Assistant">
          <header className="chat-widget-header">
            <div>
              <h6 className="mb-0">SkipQ Assistant</h6>
              <small className="text-white-50">Session: {context.userId?.slice(0, 8)}</small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => setExpanded(false)}
              aria-label="Close assistant"
            >
              <i className="bi bi-x-lg" />
            </button>
          </header>

          <div className="chat-session-badges">
            <span className="badge text-bg-light">Store: {context.storeId || 'none'}</span>
            <span className="badge text-bg-light">Cart: {context.cartItemsCount}</span>
            <span className="badge text-bg-light">Order: {context.lastOrderId || 'none'}</span>
            {assistMeta.source ? <span className="badge text-bg-info">Source: {assistMeta.source}</span> : null}
          </div>

          {assistMeta.nextStep ? (
            <div className="chat-next-step px-3 py-2 small">
              <strong>Next:</strong> {assistMeta.nextStep}
            </div>
          ) : null}

          <div className="chat-widget-body">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-msg ${message.role === 'user' ? 'user' : 'bot'}`}
              >
                <div>{message.text}</div>
                <small className="chat-msg-time">{formatTime(message.at || new Date())}</small>
              </div>
            ))}
            {working && <div className="chat-msg bot">Working on that...</div>}
          </div>

          <div className="chat-widget-quick-replies">
            {suggestedActions.map((action) => (
              <button
                type="button"
                key={action}
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setPendingAction(action)}
                disabled={working}
              >
                {ACTION_LABELS[action] || action}
              </button>
            ))}
          </div>

          {pendingAction && (
            <div className="chat-widget-confirm">
              <span className="small text-muted">Suggested next action:</span>
              <button
                type="button"
                className="btn btn-sm btn-skipq"
                onClick={() => runAction(pendingAction)}
                disabled={working}
              >
                Confirm {ACTION_LABELS[pendingAction] || pendingAction}
              </button>
            </div>
          )}

          <form
            className="chat-widget-input"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
          >
            <input
              type="text"
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type: connect store STORE001"
              disabled={working}
            />
            <button type="submit" className="btn btn-skipq" disabled={working || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-widget-fab btn btn-skipq rounded-circle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-label="Toggle chat assistant"
      >
        <i className={`bi ${expanded ? 'bi-chat-square-dots-fill' : 'bi-chat-right-dots-fill'}`} />
      </button>
    </div>
  );
};

export default ChatWidget;
