import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<'google' | 'slack' | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'Wachtwoorden komen niet overeen',
                variant: 'destructive',
            });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            toast({
                title: 'Succes',
                description: 'Controleer je e-mail voor de bevestigingslink',
            });

            navigate('/login');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setOauthLoading('google');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/profile`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: 'Google Sign Up Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setOauthLoading(null);
        }
    };

    const handleSlackSignUp = async () => {
        setOauthLoading('slack');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'slack',
                options: {
                    redirectTo: `${window.location.origin}/profile`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: 'Slack Sign Up Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setOauthLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Account aanmaken</CardTitle>
                    <CardDescription className="text-center">
                        Maak een account aan om te beginnen
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mailadres</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="naam@voorbeeld.nl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Wachtwoord</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Bezig met registreren...' : 'Registreren'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Of registreer met
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleSignUp}
                            disabled={oauthLoading !== null}
                        >
                            {oauthLoading === 'google' ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Bezig met Google...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span>Google</span>
                                </div>
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleSlackSignUp}
                            disabled={oauthLoading !== null}
                        >
                            {oauthLoading === 'slack' ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Bezig met Slack...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6.194 14.644c0 1.16-.943 2.107-2.107 2.107-1.164 0-2.107-.947-2.107-2.107 0-1.16.943-2.106 2.107-2.106h2.107v2.106zM7.681 14.644c0-1.16.943-2.106 2.107-2.106 1.164 0 2.107.946 2.107 2.106v5.274c0 1.16-.943 2.107-2.107 2.107-1.164 0-2.107-.947-2.107-2.107v-5.274zM9.167 9.322c-1.164 0-2.107-.946-2.107-2.106 0-1.16.943-2.107 2.107-2.107s2.107.947 2.107 2.107c0 1.16-.943 2.106-2.107 2.106zM9.167 7.215c1.164 0 2.107-.946 2.107-2.107 0-1.16-.943-2.106-2.107-2.106H3.893c-1.164 0-2.107.946-2.107 2.106 0 1.161.943 2.107 2.107 2.107h5.274zM16.833 9.322c1.164 0 2.107-.946 2.107-2.106 0-1.16-.943-2.107-2.107-2.107s-2.107.947-2.107 2.107c0 1.16.943 2.106 2.107 2.106zM15.347 9.322c-1.164 0-2.107.946-2.107 2.107v5.274c0 1.16.943 2.107 2.107 2.107s2.107-.947 2.107-2.107v-5.274c0-1.161-.943-2.107-2.107-2.107zM20.107 7.215c1.164 0 2.107-.946 2.107-2.107 0-1.16-.943-2.106-2.107-2.106h-5.274c-1.164 0-2.107.946-2.107 2.106 0 1.161.943 2.107 2.107 2.107h5.274zM20.107 9.322h-2.107c-1.164 0-2.107.946-2.107 2.106 0 1.16.943 2.107 2.107 2.107s2.107-.947 2.107-2.107c0-1.16-.943-2.106-2.107-2.106z"/>
                                    </svg>
                                    <span>Slack</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-slate-500">
                        Heb je al een account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log hier in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register; 