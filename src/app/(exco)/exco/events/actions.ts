"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import {
  createEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  completeEvent,
} from "@/lib/events/admin";
import { eventSchema } from "@/lib/validation/event";

export async function createEventAction(formData: FormData) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid event data: " + JSON.stringify(parsed.error.flatten()));
  }

  const event = await createEvent(actor.id, parsed.data);
  redirect(`/exco/events/${event.id}`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  const raw = Object.fromEntries(formData.entries());
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid event data: " + JSON.stringify(parsed.error.flatten()));
  }

  await updateEvent(actor.id, eventId, parsed.data);
  revalidatePath(`/exco/events/${eventId}`);
  redirect(`/exco/events/${eventId}`);
}

export async function publishEventAction(eventId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await publishEvent(actor.id, eventId);
  revalidatePath(`/exco/events/${eventId}`);
  revalidatePath("/exco/events");
}

export async function cancelEventAction(eventId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await cancelEvent(actor.id, eventId);
  revalidatePath(`/exco/events/${eventId}`);
  revalidatePath("/exco/events");
}

export async function completeEventAction(eventId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await completeEvent(actor.id, eventId);
  revalidatePath(`/exco/events/${eventId}`);
  revalidatePath("/exco/events");
}
