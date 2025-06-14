
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import TermsOfService from '@/components/TermsOfService';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [concordoTermos, setConcordoTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Função para validar senha
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasNumber && hasSpecialChar
    };
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        // Validações para cadastro
        if (!nomeCompleto || !dataNascimento || !telefone) {
          setError('Todos os campos são obrigatórios');
          return;
        }
        
        if (!passwordValidation.isValid) {
          setError('A senha não atende aos critérios de segurança');
          return;
        }
        
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          return;
        }
        
        if (!concordoTermos) {
          setError('Você deve concordar com os Termos de Uso');
          return;
        }
        
        // Limpar formatação do telefone antes de enviar
        const cleanPhone = telefone.replace(/\D/g, '');
        
        const { error } = await signUp(email, password, nomeCompleto, dataNascimento, cleanPhone);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await resetPassword(forgotEmail);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Link de recuperação enviado para seu email!');
        setShowForgotPassword(false);
        setForgotEmail('');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4">
      <Card className="w-full max-w-md border-mango-200">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🥭</span>
            <span className="text-2xl font-bold text-mango-900">Mango</span>
          </div>
          <CardTitle className="text-mango-900">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Entre na sua conta para continuar' 
              : 'Crie sua conta para começar a usar o Mango'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo</Label>
                  <Input
                    id="nomeCompleto"
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    placeholder="Seu nome completo"
                    required={!isLogin}
                    className="border-mango-200 focus:border-mango-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    required={!isLogin}
                    className="border-mango-200 focus:border-mango-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required={!isLogin}
                    className="border-mango-200 focus:border-mango-500"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="border-mango-200 focus:border-mango-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="border-mango-200 focus:border-mango-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mango-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      required={!isLogin}
                      className="border-mango-200 focus:border-mango-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mango-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Indicadores de validação da senha */}
                {password && (
                  <div className="space-y-2 p-3 bg-mango-50 rounded-md">
                    <p className="text-sm font-medium text-mango-700">Critérios da senha:</p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        {passwordValidation.minLength ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={passwordValidation.minLength ? 'text-green-700' : 'text-red-700'}>
                          Mínimo 8 caracteres
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {passwordValidation.hasUpperCase ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={passwordValidation.hasUpperCase ? 'text-green-700' : 'text-red-700'}>
                          Uma letra maiúscula
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {passwordValidation.hasNumber ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={passwordValidation.hasNumber ? 'text-green-700' : 'text-red-700'}>
                          Um número
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {passwordValidation.hasSpecialChar ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                        <span className={passwordValidation.hasSpecialChar ? 'text-green-700' : 'text-red-700'}>
                          Um caractere especial
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {confirmPassword && password !== confirmPassword && (
                  <Alert variant="destructive">
                    <AlertDescription>As senhas não coincidem</AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="termos"
                  checked={concordoTermos}
                  onCheckedChange={(checked) => setConcordoTermos(checked as boolean)}
                />
                <div className="text-sm">
                  <Label htmlFor="termos" className="text-sm">
                    Eu concordo com os{' '}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-mango-600 hover:text-mango-700"
                      onClick={() => setShowTermsDialog(true)}
                    >
                      Termos de Uso
                    </Button>
                  </Label>
                </div>
              </div>
            )}

            {(error || success) && (
              <Alert variant={error ? "destructive" : "default"}>
                <AlertDescription>{error || success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-mango-500 hover:bg-mango-600" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-2 text-center">
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-mango-600 hover:text-mango-700"
              >
                Esqueci minha senha
              </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-mango-600 hover:text-mango-700"
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Entre'
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para esqueci a senha */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="border-mango-200 focus:border-mango-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-mango-500 hover:bg-mango-600" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Termos de Uso */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos de Uso</DialogTitle>
          </DialogHeader>
          <TermsOfService />
          <div className="flex justify-end mt-4">
            <Button 
              onClick={() => setShowTermsDialog(false)}
              className="bg-mango-500 hover:bg-mango-600"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
