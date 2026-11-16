import LottieAnimation from '@/components/LottieAnimation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { postSignInTarget } from '@/lib/authRouting';
import { Lock, Mail } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useT } from '@/i18n/lang';

const T = {
  en: {
    error: 'Error', success: 'Success', signedIn: 'Signed in successfully!', checkEmail: 'Check your email for verification link!',
    story: 'Your next chapter starts with practice.',
    storyBody: 'Sign in to keep your learning progress, return to your projects, and continue building practical data skills.',
    welcome: 'Welcome to DataEntropy', sub: 'Sign in or create your account to continue',
    signIn: 'Sign In', signUp: 'Sign Up', email: 'Email', password: 'Password',
    emailPh: 'Enter your email', passwordPh: 'Enter your password',
    signingIn: 'Signing in...', creating: 'Creating account...',
  },
  bn: {
    error: 'সমস্যা হয়েছে', success: 'সফল', signedIn: 'সাইন ইন হয়েছে!', checkEmail: 'ভেরিফিকেশন লিংকের জন্য আপনার email দেখুন!',
    story: 'প্র্যাকটিসের মধ্য দিয়েই শুরু হোক আপনার পরের অধ্যায়।',
    storyBody: 'সাইন ইন করে আপনার শেখার অগ্রগতি ধরে রাখুন, প্রজেক্টে ফিরে যান এবং ব্যবহারিক ডেটা স্কিল গড়ে তুলুন।',
    welcome: 'DataEntropy-তে স্বাগতম', sub: 'চালিয়ে যেতে সাইন ইন করুন বা অ্যাকাউন্ট খুলুন',
    signIn: 'সাইন ইন', signUp: 'সাইন আপ', email: 'Email', password: 'পাসওয়ার্ড',
    emailPh: 'আপনার email লিখুন', passwordPh: 'আপনার পাসওয়ার্ড লিখুন',
    signingIn: 'সাইন ইন হচ্ছে...', creating: 'অ্যাকাউন্ট খোলা হচ্ছে...',
  },
};

const Auth = () => {
  const t = useT(T);
  const reduce = useReducedMotion();
  const rise = (delay: number) => reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, isAnonymous, isAdmin, adminChecked } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // `user` alone is not a signal any more: every visitor is signed in, guests
  // anonymously. Redirecting on it bounced anonymous visitors straight back to
  // /admin, which sent them here again — a loop where nothing rendered.
  useEffect(() => {
    const target = postSignInTarget({ hasUser: !!user, isAnonymous, adminChecked, isAdmin });
    if (target) navigate(target);
  }, [user, isAnonymous, isAdmin, adminChecked, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t.success,
        description: t.signedIn,
      });
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t.success,
        description: t.checkEmail,
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-layout">
      <motion.div className="auth-story" {...rise(0)}>
        <Link to="/">DataEntropy</Link>
        <h2>{t.story}</h2>
        <p>{t.storyBody}</p>
        <div aria-hidden="true">
          <LottieAnimation src="/animations/data-insights.json" loop={false} className="hidden md:block h-56 w-64" />
        </div>
      </motion.div>
      <motion.div className="w-full max-w-md" {...rise(0.12)}>
      <Card className="auth-panel w-full">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">{t.welcome}</h1>
          <CardDescription>{t.sub}</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
            <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.emailPh}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t.passwordPh}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.signingIn : t.signIn}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t.emailPh}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t.password}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={t.passwordPh}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.creating : t.signUp}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
