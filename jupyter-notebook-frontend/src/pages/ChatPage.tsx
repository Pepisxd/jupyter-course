"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Brain,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Navbar from "../components/HomePage/navbar";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTyping?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente de IA para Jupyter Curso. Estoy aquí para ayudarte con cualquier pregunta sobre programación, ciencia de datos, o cualquier tema relacionado con nuestros cursos. ¿En qué puedo ayudarte hoy?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const responses = [
      "Excelente pregunta. En Jupyter Notebooks, puedes usar esa funcionalidad para mejorar tu análisis de datos.",
      "Te recomiendo explorar las librerías de Python como pandas y numpy para ese tipo de operaciones.",
      "Esa es una práctica muy común en ciencia de datos. Te sugiero revisar nuestro módulo sobre visualización de datos.",
      "Perfecto, ese concepto es fundamental en machine learning. ¿Te gustaría que profundice en algún aspecto específico?",
      "Gran observación. En nuestros cursos cubrimos exactamente ese tema con ejemplos prácticos.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateAIResponse(inputValue),
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "¡Hola! Soy tu asistente de IA para Jupyter Curso. Estoy aquí para ayudarte con cualquier pregunta sobre programación, ciencia de datos, o cualquier tema relacionado con nuestros cursos. ¿En qué puedo ayudarte hoy?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A]">
      <Navbar />

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF5722] to-[#FF9800] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Jupyter AI Assistant</h1>
                  <p className="text-white/80 text-sm">
                    Tu compañero de aprendizaje inteligente
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearChat}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title="Limpiar chat"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[80%] ${
                      message.sender === "user"
                        ? "flex-row-reverse space-x-reverse"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-[#FF5722] to-[#FF9800]"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative group ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-white border border-gray-200"
                      } rounded-2xl p-4 shadow-lg`}
                    >
                      <p
                        className={`${
                          message.sender === "user"
                            ? "text-white"
                            : "text-gray-800"
                        } leading-relaxed`}
                      >
                        {message.content}
                      </p>

                      {/* Message Actions */}
                      <div
                        className={`absolute ${
                          message.sender === "user" ? "left-0" : "right-0"
                        } top-0 transform ${
                          message.sender === "user"
                            ? "-translate-x-full"
                            : "translate-x-full"
                        } opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1 ml-2 mr-2`}
                      >
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          title="Copiar mensaje"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {message.sender === "ai" && (
                          <>
                            <button
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Me gusta"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="No me gusta"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                      <div
                        className={`text-xs ${
                          message.sender === "user"
                            ? "text-white/70"
                            : "text-gray-500"
                        } mt-2`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5722] to-[#FF9800] flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
                      <div className="flex space-x-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  className="w-full p-4 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-4 bg-gradient-to-r from-[#FF5722] to-[#FF9800] text-white rounded-2xl hover:from-[#FF5722]/90 hover:to-[#FF9800]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "¿Cómo empiezo con Python?",
                "Explícame pandas",
                "¿Qué es machine learning?",
                "Ayuda con visualización",
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;
