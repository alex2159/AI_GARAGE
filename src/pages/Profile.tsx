import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { CITIES, type CityCode } from "@contracts/cities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const NO_CITY = "__none__";

type FormValues = {
  displayName: string;
  city: string;
};

type ProfileData = {
  displayName: string;
  email: string;
  city: string | null;
};

// Форма монтируется только когда профиль уже загружен — defaultValues
// заполнены с первого рендера, isDirty работает корректно.
function ProfileForm({ profile }: { profile: ProfileData }) {
  const utils = trpc.useUtils();
  const form = useForm<FormValues>({
    defaultValues: {
      displayName: profile.displayName,
      city: profile.city ?? NO_CITY,
    },
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Профиль сохранён");
      utils.profile.me.invalidate();
      utils.events.list.invalidate();
      // Текущие значения становятся новой точкой отсчёта isDirty.
      form.reset(form.getValues());
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate({
      displayName: values.displayName.trim() || undefined,
      city: values.city === NO_CITY ? null : (values.city as CityCode),
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-1.5">
        <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
          Имя
        </Label>
        <Input
          {...form.register("displayName")}
          placeholder="Как к вам обращаться"
          className="rounded-sm"
          autoComplete="name"
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
          E-mail
        </Label>
        <Input
          value={profile.email}
          disabled
          className="rounded-sm bg-neutral-50 text-neutral-500"
        />
        <p className="text-xs text-neutral-400">
          Почта привязана к аккаунту Kimi и не редактируется.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
          Город
        </Label>
        <Controller
          control={form.control}
          name="city"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="rounded-sm">
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value={NO_CITY}>Не выбран</SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-neutral-400">
          Календарь показывает события выбранного города.
        </p>
      </div>

      <div>
        <Button
          type="submit"
          disabled={updateMutation.isPending || !form.formState.isDirty}
          className="h-11 rounded-sm font-mono text-xs uppercase tracking-[0.15em]"
        >
          {updateMutation.isPending ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { data: profile, isLoading } = trpc.profile.me.useQuery();

  return (
    <section className="grid max-w-xl gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          Личный кабинет
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Профиль</h1>
      </header>

      {isLoading || !profile ? (
        <div className="grid gap-4">
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-12 rounded-sm" />
        </div>
      ) : (
        <ProfileForm key={profile.id} profile={profile} />
      )}
    </section>
  );
}
