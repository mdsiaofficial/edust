import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLoginMutation } from "@/app/api/v0/auth";
import { useGetUserQuery } from "@/app/api/v0/user";
import { setAuthentication } from "@/app/features/auth";
import { useAppDispatch } from "@/app/hooks";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Typography,
} from "@/components/ui";
import { toast } from "@/hooks/shadcn-ui";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { NewSocialAuth } from "./new-social-auth";

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).min(2, {
    message: "Email must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export const SignIn: React.FC = () => {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch } = useGetUserQuery();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onVisibilityClick = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    login(data)
      .unwrap()
      .then((res) => {
        if (res?.status) {
          toast({
            variant: "success",
            title: res?.message,
          });

          refetch()
            .then((res) => {
              if (res) {
                dispatch(setAuthentication({ isAuthenticated: true }));
                navigate(location.state?.from?.pathname || "/");
              }
            })
            .catch((error) => {
              if (error) {
                toast({
                  variant: "destructive",
                  title: error?.data?.message,
                  description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                      <code className="text-white">
                        {JSON.stringify(error, null, 2)}
                      </code>
                    </pre>
                  ),
                });
              }
            });
        }
      })
      .catch((error) => {
        if (error?.data?.status) {
          toast({
            variant: "destructive",
            title: error?.data?.message,
          });
        }
      });
  }

  return (
    <>
      <Helmet>
        <title>Sign In to Edist - Access Your Account</title>
      </Helmet>
      <div className="flex h-screen items-center justify-center p-4">
        <Form {...form}>
          <div className="w-full rounded-md p-4 shadow sm:max-w-96 md:max-w-[450px] md:p-6">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to={"/auth/forgot-password"}
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot Your Password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="realative">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="********"
                          icon={isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                          onIconClick={onVisibilityClick}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <BarLoader color="#fff" /> : "Sign In"}
              </Button>
            </form>
            <div className="my-4">
              <NewSocialAuth />
            </div>

            <div className="mb-4 mt-4 flex items-center justify-center gap-4">
              <Typography className="text-sm">
                Don't have an account?{" "}
                <Link to={"/auth/sign-up"}>
                  <Typography className="ml-1 inline-block underline">
                    Sign Up
                  </Typography>
                </Link>
              </Typography>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};
