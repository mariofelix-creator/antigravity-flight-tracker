"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(120, "El nombre es muy largo"),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
    }),
  })
  .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignupInput = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setServerError(
          "Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?"
        );
      } else {
        setServerError(
          "Ocurrió un error al crear tu cuenta. Intenta más tarde."
        );
      }
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Crea tu cuenta gratis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Empieza a invertir desde $10 USD hoy mismo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full name */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Ana García López"
            autoComplete="name"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-xs text-danger-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-danger-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mín. 8 caracteres, 1 mayúscula y 1 número"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-danger-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms and conditions */}
        <div className="flex items-start gap-3">
          <input
            id="acceptTerms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-500 focus:ring-offset-1 cursor-pointer accent-brand-500"
            {...register("acceptTerms")}
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal leading-snug cursor-pointer">
            Acepto los{" "}
            <Link href="/terms" className="text-brand-600 hover:underline font-medium">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline font-medium">
              Política de Privacidad
            </Link>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-danger-600 -mt-2">
            {errors.acceptTerms.message}
          </p>
        )}

        {/* Server error */}
        {serverError && (
          <div className="rounded-lg bg-danger-500/10 border border-danger-400/30 px-4 py-3">
            <p className="text-sm text-danger-600">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-brand-600 font-semibold hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
