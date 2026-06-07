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

const signIn = () => {

  const { login, isLoggedIn } = useAuth();

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
    if (isLoggedIn) {
      return
    }
    login(values)
  }

  return (
    <div className='flex min-h-svh items-center justify-center bg-muted p-6'>
      <div className="w-full max-w-sm">
        <Card>
         {/* CardHeader is used to display the logo and title of the sign-up page */}
          <CardHeader className='flex flex-col items-center justify-center gap-3'>
            <Logo />
            <CardTitle className='text-xl font-semibold'>Create your Account</CardTitle>
          </CardHeader>

        {/* CardContent is used to display the sign-up form */}
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid gap-4'
              >
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='sid@example.com' {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder='••••••' type='password' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isLoggedIn}
                  type='submit'
                  className='w-full'
                >
                  {isLoggedIn && <Spinner />} Sign In    {/* show spinner when the sign-up process is in progress */}
                </Button>

                <div className="text-center text-sm">
                  Don't have an account?&nbsp;
                  <Link to="/signUp" className='underline'>Sign Up </Link>
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