"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RoleKey } from "@prisma/client";

import { requireRole } from "@/lib/auth/roles";
import {
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
} from "@/lib/events/admin";
import { eventSchema } from "@/lib/validation/event";

export async function createEventAction(formData: FormData) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid event data: " + JSON.stringify(parsed.error.flatten()));
  }

  const event = await createEvent(actor.id, parsed.data);
  redirect(`/admin/events/${event.id}`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid event data: " + JSON.stringify(parsed.error.flatten()));
  }

  await updateEvent(actor.id, eventId, parsed.data);
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

export async function publishEventAction(eventId: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await publishEvent(actor.id, eventId);
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
}

export async function cancelEventAction(eventId: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await cancelEvent(actor.id, eventId);
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
}

export async function completeEventAction(eventId: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await completeEvent(actor.id, eventId);
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
}
