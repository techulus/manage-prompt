class DateTimeHandler {
  private date: Date;

  constructor() {
    this.date = new Date();
  }

  public fromSeconds(seconds: number) {
    this.date = new Date(seconds * 1000);
    return this;
  }

  public fromJSDate(date: Date) {
    this.date = date;
    return this;
  }

  public fromISO(date: string) {
    this.date = new Date(date);
    return this;
  }

  public toDateString() {
    return this.date.toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  public toNiceFormat() {
    return this.date.toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
}

export const DateTime = new DateTimeHandler();
