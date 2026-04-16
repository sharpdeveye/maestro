import { skills, type SkillData } from '../generated/skills-data';

/**
 * Skill loader — provides access to bundled skill content.
 */
export class SkillLoader {
  private skillMap = new Map<string, SkillData>();

  constructor() {
    for (const skill of skills) {
      this.skillMap.set(skill.name, skill);
    }
  }

  /** Get a skill by name (e.g., "zero-defect") */
  get(name: string): SkillData | undefined {
    return this.skillMap.get(name);
  }

  /** Get all user-invocable skills */
  getInvocable(): SkillData[] {
    return skills.filter((s) => s.userInvocable);
  }

  /** Get all skills */
  getAll(): SkillData[] {
    return [...skills];
  }

  /** Get skill content by name */
  getContent(name: string): string | undefined {
    return this.skillMap.get(name)?.content;
  }

  /** Get skills as JSON for webview */
  toJSON(): Array<{
    name: string;
    description: string;
    category: string;
    userInvocable: boolean;
  }> {
    return skills.map((s) => ({
      name: s.name,
      description: s.description,
      category: s.category,
      userInvocable: s.userInvocable,
    }));
  }
}
