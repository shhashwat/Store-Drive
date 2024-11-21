"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2).max(50),
  fullName: z.string().min(2).max(50),
  email: z.string().min(2).max(50),
})


import React from 'react'

type FormType = "sign-in" | "sign-up";

const AuthForm = ( { type }: { type: FormType }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
    },
  })
 
  const onSubmit = async(values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <h1 className="form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>
      { type === "sign-up" && <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <div className="shad-form-item" >
            <FormLabel className="shad-form-label" >Full Name</FormLabel>

            <FormControl>
              <Input className="shad-input" placeholder="Enter Your Name" {...field} />
            </FormControl>
            </div>

            <FormMessage className="shad-form-message" />
          </FormItem>
        )}
        />
        
        }
        <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <div className="shad-form-item" >
            <FormLabel className="shad-form-label" >Email</FormLabel>

            <FormControl>
              <Input className="shad-input" placeholder="Enter Your Email" {...field} />
            </FormControl>
            </div>

            <FormMessage className="shad-form-message" />
          </FormItem>
        )}
        />
      <Button type="submit">Submit</Button>
    </form>
    </Form>

    {/* OTP verification */}
    </>
  )
}

export default AuthForm