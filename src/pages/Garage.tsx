import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import {
  CAR_DESCRIPTION_MAX,
  CAR_YEAR_MIN,
  carInputSchema,
  carYearMax,
  type CarInput,
} from "@contracts/cars";
import type { CarDTO } from "@contracts/cars";
import PlateChip from "@/components/PlateChip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// year намеренно пуст: ввод с valueAsNumber даёт NaN, и zod покажет
// понятную ошибку «Год должен быть числом» вместо неявного нуля.
const EMPTY: CarInput = {
  brand: "",
  model: "",
  year: undefined as unknown as number,
  plateNumber: "",
  description: "",
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-neutral-900 underline">{error}</p>}
    </div>
  );
}

export default function Garage() {
  const utils = trpc.useUtils();
  const { data: cars, isLoading } = trpc.cars.list.useQuery();
  const [editTarget, setEditTarget] = useState<CarDTO | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarDTO | null>(null);

  const invalidate = () => utils.cars.list.invalidate();

  const createMutation = trpc.cars.create.useMutation({
    onSuccess: () => {
      toast.success("Автомобиль добавлен");
      setEditTarget(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.cars.update.useMutation({
    onSuccess: () => {
      toast.success("Автомобиль обновлён");
      setEditTarget(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const removeMutation = trpc.cars.remove.useMutation({
    onSuccess: () => {
      toast.success("Автомобиль удалён");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const form = useForm<CarInput>({
    resolver: zodResolver(carInputSchema),
    values: editTarget && editTarget !== "new" ? editTarget : EMPTY,
  });

  const onSubmit = form.handleSubmit((data) => {
    if (editTarget === "new") {
      createMutation.mutate(data);
    } else if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, data });
    }
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500">
            Личный кабинет
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Гараж</h1>
        </div>
        <Button
          type="button"
          onClick={() => {
            form.reset(EMPTY);
            setEditTarget("new");
          }}
          className="h-11 rounded-sm font-mono text-xs uppercase tracking-[0.15em]"
        >
          <Plus className="size-4" aria-hidden />
          Добавить авто
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 rounded-sm" />
          ))}
        </div>
      ) : !cars || cars.length === 0 ? (
        <div className="border border-dashed border-neutral-300 px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            Гараж пуст
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
            Добавьте первый автомобиль: марка, модель, год, госномер и пара
            слов о машине.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {cars.map((car) => (
            <li
              key={car.id}
              className="group flex flex-col gap-4 border border-neutral-900 bg-white p-5 transition-colors duration-200 hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {car.brand} {car.model}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-neutral-500">
                    {car.year} год
                  </p>
                </div>
                <PlateChip value={car.plateNumber} />
              </div>
              {car.description && (
                <p className="line-clamp-3 text-sm text-neutral-600">
                  {car.description}
                </p>
              )}
              <div className="mt-auto flex gap-2 border-t border-neutral-200 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.15em]"
                  onClick={() => setEditTarget(car)}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Изменить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-sm font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-500 hover:text-black"
                  onClick={() => setDeleteTarget(car)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Диалог добавления / редактирования */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="rounded-sm sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.2em]">
              {editTarget === "new" ? "Новый автомобиль" : "Редактировать"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Марка" error={form.formState.errors.brand?.message}>
                <Input
                  {...form.register("brand")}
                  placeholder="ВАЗ"
                  className="rounded-sm"
                  autoComplete="off"
                />
              </Field>
              <Field label="Модель" error={form.formState.errors.model?.message}>
                <Input
                  {...form.register("model")}
                  placeholder="2101"
                  className="rounded-sm"
                  autoComplete="off"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={`Год (${CAR_YEAR_MIN}–${carYearMax()})`}
                error={form.formState.errors.year?.message}
              >
                <Input
                  type="number"
                  {...form.register("year", { valueAsNumber: true })}
                  placeholder="1975"
                  className="rounded-sm"
                />
              </Field>
              <Field
                label="Госномер"
                error={form.formState.errors.plateNumber?.message}
              >
                <Input
                  {...form.register("plateNumber")}
                  placeholder="А123БВ77"
                  className="rounded-sm font-mono uppercase"
                  autoComplete="off"
                />
              </Field>
            </div>
            <Field
              label={`Описание (до ${CAR_DESCRIPTION_MAX} символов)`}
              error={form.formState.errors.description?.message}
            >
              <Textarea
                {...form.register("description")}
                rows={4}
                placeholder="История машины, особенности, состояние…"
                className="rounded-sm"
              />
            </Field>
            <DialogFooter className="gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-sm font-mono text-xs uppercase tracking-[0.15em]"
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Подтверждение удаления */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-[0.2em]">
              Удалить автомобиль?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.brand} ${deleteTarget.model}, ${deleteTarget.year} — будет удалён из гаража без возможности восстановления.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm font-mono text-xs uppercase tracking-[0.15em]">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && removeMutation.mutate({ id: deleteTarget.id })
              }
              className="rounded-sm bg-black font-mono text-xs uppercase tracking-[0.15em] text-white hover:bg-neutral-800"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
