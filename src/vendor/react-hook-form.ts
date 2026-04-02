"use client";

import * as React from "react";

type ResolverResult<T> = {
  values: T;
  errors: Record<string, { message: string }>;
};

type Resolver<T> = (values: T) => ResolverResult<T> | Promise<ResolverResult<T>>;

type UseFormOptions<T> = {
  defaultValues: T;
  resolver?: Resolver<T>;
};

type RegisterOptions = {
  valueAsNumber?: boolean;
};

type SubmitHandler<T> = (values: T) => void | Promise<void>;

type RegisterReturn<TValue> = {
  name: string;
  value: TValue extends boolean ? undefined : TValue | "";
  checked: TValue extends boolean ? boolean : undefined;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
};

export function useForm<T extends Record<string, any>>({
  defaultValues,
  resolver,
}: UseFormOptions<T>) {
  const [values, setValues] = React.useState<T>(defaultValues);
  const [errors, setErrors] = React.useState<Record<string, { message: string }>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const register = <TName extends keyof T>(
    name: TName,
    options?: RegisterOptions,
  ): RegisterReturn<T[TName]> => ({
    name: String(name),
    value:
      typeof values[name] === "boolean"
        ? (undefined as RegisterReturn<T[TName]>["value"])
        : values[name] === undefined || values[name] === null
          ? ("" as RegisterReturn<T[TName]>["value"])
          : (values[name] as RegisterReturn<T[TName]>["value"]),
    checked:
      typeof values[name] === "boolean"
        ? (Boolean(values[name]) as RegisterReturn<T[TName]>["checked"])
        : (undefined as RegisterReturn<T[TName]>["checked"]),
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const target = event.target;
      const nextValue =
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : options?.valueAsNumber
            ? Number(target.value)
            : target.value;

      setValues((current) => ({ ...current, [name]: nextValue as T[TName] }));
    },
  });

  const handleSubmit =
    (callback: SubmitHandler<T>) => async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);

      try {
        if (resolver) {
          const result = await resolver(values);
          setErrors(result.errors);

          if (Object.keys(result.errors).length > 0) {
            return;
          }

          await callback(result.values);
          return;
        }

        await callback(values);
      } finally {
        setIsSubmitting(false);
      }
    };

  const reset = (nextValues: T = defaultValues) => {
    setValues(nextValues);
    setErrors({});
  };

  const setValue = (name: keyof T, value: T[keyof T]) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const watch = (name: keyof T) => values[name];

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  };
}
