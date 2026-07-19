import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useAuth from '@/hooks/useAuth'
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/logo'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { EyeOff, Eye } from 'lucide-react'

const signIn = () => {

  const [showPassword, setShowPassword] = useState(false)

  const { login, isLoggingIn } = useAuth();

  const formSchema = z.object({
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(6, "Password must be atleast 6 characters")
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isLoggingIn) {
      return
    }
    login(values)
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-6">

      <div className="pointer-events-none absolute -left-16 top-[8%] h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-[float_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-10 bottom-[10%] h-44 w-44 rounded-full bg-primary/10 blur-3xl animate-[float_12s_ease-in-out_infinite_2.5s]" />

      <div className="relative w-full max-w-sm">
        <Card className="border-border bg-card shadow-xl shadow-primary/10">

          <CardHeader className="flex flex-col items-center justify-center gap-3 pt-9">
            <Logo imgClass="size-10 " textClass="text-foreground text-xl" />
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Sign In to your Account
            </CardTitle>
            <p className="text-sm text-muted-foreground">Pick up right where you left off</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-4"
              >

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="sid@example.com"
                          className="border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}

                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isLoggingIn}
                  type="submit"
                  className="w-full font-semibold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
                >
                  {isLoggingIn && <Spinner />} Sign In
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?&nbsp;
                  <Link
                    to="/signUp"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Sign Up
                  </Link>
                </div>

              </form>
            </Form>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}
export default signIn