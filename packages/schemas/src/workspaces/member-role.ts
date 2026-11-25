import { MEMBER_ROLES } from '@omniva/domain-types';
import { z } from 'zod';

/** What a Member may do in a workspace: Owner, Editor or Viewer (GLOSSARY.md). */
export const MemberRoleSchema = z.enum(MEMBER_ROLES);
