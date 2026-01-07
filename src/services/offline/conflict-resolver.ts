interface ConflictItem {
  id: string;
  updatedAt: string;
  [key: string]: any;
}

interface ConflictResolution<T> {
  winner: 'local' | 'remote';
  action: 'push' | 'pull' | 'merge';
  data: T;
  message?: string;
}

export class ConflictResolver {
  resolveByTimestamp<T extends ConflictItem>(
    local: T,
    remote: T
  ): ConflictResolution<T> {
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();

    if (localTime > remoteTime) {
      return {
        winner: 'local',
        action: 'push',
        data: local,
        message: 'Cambio local más reciente - se enviará al servidor',
      };
    } else if (remoteTime > localTime) {
      return {
        winner: 'remote',
        action: 'pull',
        data: remote,
        message: 'Cambio remoto más reciente - se actualizará localmente',
      };
    } else {
      return {
        winner: 'local',
        action: 'push',
        data: local,
        message: 'Timestamps iguales - se prefiere el cambio local',
      };
    }
  }

  handleDeleteConflict<T extends ConflictItem>(
    local: T | null,
    remote: T | null,
    wasDeleted: { local: boolean; remote: boolean }
  ): ConflictResolution<T | null> {
    if (wasDeleted.remote && local && !wasDeleted.local) {
      return {
        winner: 'remote',
        action: 'pull',
        data: null,
        message: 'El registro fue eliminado en el servidor - se eliminará localmente',
      };
    }

    if (wasDeleted.local && remote && !wasDeleted.remote) {
      return {
        winner: 'local',
        action: 'push',
        data: null,
        message: 'El registro fue eliminado localmente - se eliminará en el servidor',
      };
    }

    if (wasDeleted.local && wasDeleted.remote) {
      return {
        winner: 'local',
        action: 'pull',
        data: null,
        message: 'El registro fue eliminado en ambos lados',
      };
    }

    if (local && remote) {
      return this.resolveByTimestamp(local, remote);
    }

    return {
      winner: 'local',
      action: 'push',
      data: local,
      message: 'Conflicto desconocido - se prefiere el cambio local',
    };
  }

  detectConflict<T extends ConflictItem>(local: T, remote: T): boolean {
    return local.updatedAt !== remote.updatedAt;
  }

  logConflict(entity: string, id: string, resolution: ConflictResolution<any>): void {
    const debugEnabled = typeof window !== 'undefined' && 
      localStorage.getItem('offline_debug') === 'true';
    
    if (debugEnabled) {
      console.group(`🔧 Conflicto Resuelto: ${entity} (${id})`);
      console.log('Ganador:', resolution.winner);
      console.log('Acción:', resolution.action);
      console.log('Mensaje:', resolution.message);
      console.log('Datos:', resolution.data);
      console.groupEnd();
    }
  }
}

export const conflictResolver = new ConflictResolver();
