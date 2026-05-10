export interface StopInput {
  sessionId: string;
  taskCompleted?: boolean;
}

export async function handleStop(input: StopInput): Promise<void> {
  console.log(JSON.stringify({
    type: 'session_ended',
    sessionId: input.sessionId,
    taskCompleted: input.taskCompleted,
  }));
}