import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Token } from '@/lib/GameLogic';
import { TokenChip } from './TokenChip';

interface ReorderModalProps {
  isOpen: boolean;
  tokens: Token[];
  onConfirm: (newOrder: number[]) => void;
  onCancel: () => void;
}

function SortableToken({ token, index }: { token: Token; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-3 p-3 rounded-xl
        bg-card/80 border border-border
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'glow-teal' : ''}
      `}
    >
      <span className="text-muted-foreground font-heading text-lg w-6">
        {index + 1}
      </span>
      <TokenChip token={token} size="md" showLabel={false} />
      <span className="text-foreground font-body text-sm ml-2">
        Player {token.playerId + 1}'s token
      </span>
      <span className="ml-auto text-muted-foreground text-lg">⠿</span>
    </div>
  );
}

export function ReorderModal({ isOpen, tokens: initialTokens, onConfirm, onCancel }: ReorderModalProps) {
  const [tokens, setTokens] = useState(initialTokens);
  
  // Reset tokens when modal opens with new tokens
  useEffect(() => {
    if (isOpen) {
      setTokens(initialTokens);
    }
  }, [isOpen, initialTokens]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTokens((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleConfirm = () => {
    onConfirm(tokens.map(t => t.id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-wood rounded-2xl border border-border p-6 max-w-md w-full"
          >
            <h2 className="font-heading text-secondary text-2xl text-center mb-2 text-glow">
              🔄 Reorder Tokens
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-6 font-body">
              Drag to rearrange. Top token is #1.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tokens.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 mb-6">
                  {tokens.map((token, index) => (
                    <SortableToken key={token.id} token={token} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-heading bg-muted text-muted-foreground"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-heading bg-gradient-to-r from-accent to-teal text-accent-foreground glow-teal"
              >
                Confirm ✓
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
