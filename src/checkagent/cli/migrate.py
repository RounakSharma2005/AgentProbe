
"""CLI command: checkagent migrate-cassettes.

Discovers cassette files and upgrades them to the current schema version.
"""

from __future__ import annotations

from pathlib import Path

import click

from checkagent.replay.cassette import CASSETTE_SCHEMA_VERSION
from checkagent.replay.migration import migrate_directory


@click.command("migrate-cassettes")
@click.argument(
    "directory",
    type=click.Path(exists=True, file_okay=False, path_type=Path),
    default="cassettes",
)
@click.option("--no-backup", is_flag=True, help="Skip creating .bak files.")
@click.option(
    "--dry-run",
    is_flag=True,
    help="Show what would change without writing.",
)
def migrate_cmd(directory: Path, no_backup: bool, dry_run: bool) -> None:
    """Upgrade cassette files to the current schema version."""

    if dry_run:
        click.echo("Dry run - no files will be modified.\n")

    results = migrate_directory(
        directory,
        backup=not no_backup,
        dry_run=dry_run,
    )

    if not results:
        click.echo(f"No cassette files found in {directory}.")
        return

    migrated = 0
    skipped = 0
    failed = 0

    for result in results:
        if not result.success:
            click.echo(f"FAIL {result.path}: {result.error}")
            failed += 1

        elif result.from_version == result.to_version:
            skipped += 1

        else:
            action = "would migrate" if dry_run else "migrated"
            click.echo(
                f"OK {result.path}: "
                f"v{result.from_version} -> v{result.to_version} "
                f"({action})"
            )
            migrated += 1

    click.echo()
    click.echo(
        f"Target: v{CASSETTE_SCHEMA_VERSION} | "
        f"Migrated: {migrated} | "
        f"Skipped: {skipped} | "
        f"Failed: {failed}"
    )
