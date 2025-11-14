'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import * as pdfjs from 'pdfjs-dist';
import { Download, Loader2, CheckCircle, AlertCircle, Lock, Key, Zap } from 'lucide-react';
import { saveAs } from 'file-saver';
import ProtectedTool from '@/components/tools/ProtectedTool';
import { useToolAccess } from '@/hooks/useToolAccess';

// Set worker path - using unpkg CDN for better reliability
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PDFBruteforceContent() {
  const { profile, processTool, checkFileSize } = useToolAccess();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [foundPassword, setFoundPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [attackMode, setAttackMode] = useState<'dictionary' | 'numeric' | 'custom'>('numeric');
  const [customWordlist, setCustomWordlist] = useState<string>('');
  const [maxLength, setMaxLength] = useState<number>(6);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  if (!profile) {
    return (
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleFileSelected = (selectedFiles: File[]) => {
    setFile(selectedFiles[0] || null);
    setFoundPassword('');
    setError('');
    setProgress('');
    setAttemptsCount(0);
  };

  // Common password dictionary
  const getCommonPasswords = () => [
    '123456', 'password', '12345678', 'qwerty', '123456789', 'abc123',
    '111111', '1234567', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', '000000', 'password123', '123123', '12345',
    'password1', '1234', 'qwerty123', 'admin123', 'root', 'pass',
    'test', 'user', 'master', 'dragon', 'baseball', 'iloveyou',
    'trustno1', 'sunshine', 'princess', 'football', 'shadow', 'michael',
    'jennifer', 'computer', 'rockyou', 'starwars', 'hello', 'freedom'
  ];

  // Generate numeric passwords up to maxLength
  const generateNumericPasswords = function* (length: number) {
    const max = Math.pow(10, length);
    for (let i = 0; i < max; i++) {
      yield i.toString().padStart(length, '0');
    }
  };

  const tryPassword = async (arrayBuffer: ArrayBuffer, password: string): Promise<boolean> => {
    try {
      await pdfjs.getDocument({
        data: arrayBuffer,
        password: password
      }).promise;
      return true;
    } catch (err: any) {
      if (err.name === 'PasswordException') {
        return false;
      }
      throw err;
    }
  };

  const handleBruteforceClick = () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    const fileSizeCheck = checkFileSize(file.size);
    if (!fileSizeCheck.allowed) {
      setError(fileSizeCheck.reason || 'File size exceeds plan limit');
      return;
    }

    // Show warning modal first
    setShowWarningModal(true);
  };

  const handleBruteforce = async () => {
    // Close modal
    setShowWarningModal(false);

    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setProcessing(true);
    setError('');
    setFoundPassword('');
    setAttemptsCount(0);
    setProgress('Starting password recovery...');

    try {
      await processTool('pdf-bruteforce', 'PDF Bruteforce', [file], async () => {
        const arrayBuffer = await file.arrayBuffer();

        // First check if PDF is actually password protected
        try {
          await pdfjs.getDocument({ data: arrayBuffer }).promise;
          setProgress('PDF is not password protected!');
          setFoundPassword('No password required');
          return;
        } catch (err: any) {
          if (err.name !== 'PasswordException') {
            throw new Error('Failed to load PDF file');
          }
        }

        let passwords: string[] | Generator<string> = [];
        let totalPasswords = 0;

        // Prepare password list based on attack mode
        if (attackMode === 'dictionary') {
          passwords = getCommonPasswords();
          totalPasswords = passwords.length;
          setProgress(`Testing ${totalPasswords} common passwords...`);
        } else if (attackMode === 'numeric') {
          totalPasswords = Math.pow(10, maxLength);
          setProgress(`Testing numeric passwords (0-${totalPasswords - 1})...`);
        } else if (attackMode === 'custom') {
          passwords = customWordlist.split('\n').filter(p => p.trim());
          totalPasswords = passwords.length;
          if (totalPasswords === 0) {
            throw new Error('Custom wordlist is empty');
          }
          setProgress(`Testing ${totalPasswords} custom passwords...`);
        }

        let attempts = 0;
        let found = false;

        // Test passwords
        if (attackMode === 'numeric') {
          for (let length = 1; length <= maxLength; length++) {
            if (found) break;
            const generator = generateNumericPasswords(length);

            for (const password of generator) {
              attempts++;
              setAttemptsCount(attempts);

              if (attempts % 100 === 0) {
                setProgress(`Tested ${attempts} passwords... (Current: ${password})`);
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
              }

              if (await tryPassword(arrayBuffer, password)) {
                setFoundPassword(password);
                setProgress(`Password found in ${attempts} attempts!`);
                found = true;
                break;
              }

              // Safety limit
              if (attempts >= 100000) {
                throw new Error('Maximum attempts reached (100,000). Try a different attack mode.');
              }
            }
          }
        } else {
          // Dictionary or custom wordlist
          const passwordArray: string[] = Array.isArray(passwords) ? passwords : Array.from(passwords);

          for (const password of passwordArray) {
            attempts++;
            setAttemptsCount(attempts);

            if (attempts % 10 === 0) {
              setProgress(`Tested ${attempts}/${totalPasswords} passwords...`);
              await new Promise(resolve => setTimeout(resolve, 0));
            }

            if (await tryPassword(arrayBuffer, password)) {
              setFoundPassword(password);
              setProgress(`Password found in ${attempts} attempts!`);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          throw new Error(`Password not found after ${attempts} attempts. Try a different attack mode or custom wordlist.`);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to recover password');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Key className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">PDF Password Recovery</h1>
          </div>
          <p className="text-xl text-gray-400">
            Recover forgotten passwords from protected PDF files
          </p>
          {profile && (
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-gray-400">Credits Remaining: </span>
              <span className="text-lg font-bold text-primary">{profile.credits_remaining}</span>
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="glass border border-yellow-500/50 rounded-xl p-6 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-500">Important Notice</h3>
              <p className="text-gray-300 text-sm">
                This tool is for educational purposes and recovering your own forgotten passwords only.
                Using this tool to access unauthorized content is illegal and unethical.
              </p>
              <p className="text-gray-400 text-sm">
                Note: Strong passwords may take a very long time or be impossible to crack.
                The success rate depends on password complexity.
              </p>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-white mb-3">How to use:</h2>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li>1. Upload a password-protected PDF file</li>
            <li>2. Select attack mode (Dictionary, Numeric, or Custom)</li>
            <li>3. Click "Start Password Recovery"</li>
            <li>4. Wait for the password to be found</li>
            <li>5. Use the recovered password to unlock your PDF</li>
          </ol>
        </div>

        {/* Attack Mode Selection */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Attack Mode</h2>
          <div className="space-y-4">
            {/* Dictionary Attack */}
            <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              attackMode === 'dictionary'
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="attackMode"
                value="dictionary"
                checked={attackMode === 'dictionary'}
                onChange={(e) => setAttackMode('dictionary')}
                className="mt-1"
                disabled={processing}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="font-medium text-white">Dictionary Attack</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Fast</span>
                </div>
                <p className="text-sm text-gray-400">
                  Tests ~50 most common passwords. Best for simple, common passwords.
                </p>
              </div>
            </label>

            {/* Numeric Attack */}
            <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              attackMode === 'numeric'
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="attackMode"
                value="numeric"
                checked={attackMode === 'numeric'}
                onChange={(e) => setAttackMode('numeric')}
                className="mt-1"
                disabled={processing}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium text-white">Numeric Bruteforce</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Medium</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Tests all numeric combinations. Best for PIN-like passwords.
                </p>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300">Max Length:</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={maxLength}
                    onChange={(e) => setMaxLength(parseInt(e.target.value) || 6)}
                    className="w-20 bg-gray-900/50 border border-gray-700 rounded px-3 py-1 text-white"
                    disabled={processing || attackMode !== 'numeric'}
                  />
                  <span className="text-xs text-gray-500">
                    (Tests up to {Math.pow(10, maxLength).toLocaleString()} combinations)
                  </span>
                </div>
              </div>
            </label>

            {/* Custom Wordlist */}
            <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              attackMode === 'custom'
                ? 'border-primary bg-primary/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="attackMode"
                value="custom"
                checked={attackMode === 'custom'}
                onChange={(e) => setAttackMode('custom')}
                className="mt-1"
                disabled={processing}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-5 h-5 text-primary" />
                  <span className="font-medium text-white">Custom Wordlist</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">Flexible</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Use your own list of passwords to test (one per line).
                </p>
                <textarea
                  value={customWordlist}
                  onChange={(e) => setCustomWordlist(e.target.value)}
                  placeholder="Enter passwords, one per line&#10;mypassword&#10;password123&#10;secret2024"
                  className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={processing || attackMode !== 'custom'}
                />
              </div>
            </label>
          </div>
        </div>

        {/* File Upload */}
        <FileUpload
          accept={{ 'application/pdf': ['.pdf'] }}
          maxFiles={1}
          onFilesSelected={handleFileSelected}
          multiple={false}
        />

        {/* Error Message */}
        {error && (
          <div className="glass border border-red-500/50 rounded-lg p-4 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-white font-medium">{progress}</span>
            </div>
            {attemptsCount > 0 && (
              <p className="text-sm text-gray-400">
                Attempts: {attemptsCount.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!foundPassword ? (
            <button
              onClick={handleBruteforceClick}
              disabled={!file || processing}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recovering Password...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Start Password Recovery</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full">
              <div className="glass border border-green-500/50 rounded-lg p-6 flex items-center justify-center space-x-3 text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Password recovered successfully!</span>
              </div>
              <div className="glass rounded-lg p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Your recovered password is:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-2xl font-mono font-bold text-primary bg-gray-900/50 px-6 py-3 rounded-lg">
                    {foundPassword}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(foundPassword);
                      alert('Password copied to clipboard!');
                    }}
                    className="btn-secondary"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Use this password to unlock your PDF file
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legal Warning Modal */}
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass max-w-2xl w-full rounded-xl border-2 border-red-500/50 shadow-2xl animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="bg-red-500/10 border-b border-red-500/30 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-red-500">Legal Warning & Disclaimer</h2>
                    <p className="text-gray-400 text-sm mt-1">Please read and acknowledge before proceeding</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <strong className="text-white">Educational Purpose Only:</strong> This tool is designed solely for educational purposes and to help you recover passwords from YOUR OWN PDF files.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <strong className="text-white">Legal Use Only:</strong> Using this tool to access, decrypt, or recover passwords from files you do not own or do not have explicit permission to access is ILLEGAL and UNETHICAL.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <strong className="text-white">No Liability:</strong> PDFSuit and its developers are NOT responsible for any misuse of this tool. You assume full responsibility for your actions.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <strong className="text-white">Authorized Use Only:</strong> By clicking "I Understand & Agree", you confirm that you are the legitimate owner of the PDF file or have explicit authorization to recover its password.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-yellow-500 mb-1">Important Notice:</p>
                      <p>Unauthorized access to protected documents may violate laws including but not limited to the Computer Fraud and Abuse Act (CFAA), Digital Millennium Copyright Act (DMCA), and other applicable local, state, and federal laws.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="agree-checkbox"
                      className="mt-1 w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-300">
                      I understand and agree that I am using this tool only for <strong className="text-white">educational purposes</strong> and to recover passwords from <strong className="text-white">my own PDF files</strong>. I acknowledge that I am solely responsible for any misuse and understand the legal implications of unauthorized access.
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-800 p-6 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="px-6 py-3 rounded-lg border-2 border-gray-700 text-gray-300 hover:bg-gray-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const checkbox = document.getElementById('agree-checkbox') as HTMLInputElement;
                    if (!checkbox?.checked) {
                      alert('Please check the agreement box to proceed');
                      return;
                    }
                    handleBruteforce();
                  }}
                  className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-medium transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  I Understand & Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PDFBruteforcePage() {
  return (
    <ProtectedTool toolId="pdf-bruteforce" toolName="PDF Password Recovery">
      <PDFBruteforceContent />
    </ProtectedTool>
  );
}
