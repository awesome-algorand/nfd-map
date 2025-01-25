import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as RadCard,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar.tsx";
import { CircleX } from "lucide-react";
import { Button } from "./ui/button";
import type { NfdRecord, NfdRecordCollection } from "@/lib/nfd/client";

type CardProps = {
  iconVerified: boolean;
  iconUrl: string;
  backgroundVerified: boolean;
  backgroundUrl: string;
  nfd: NfdRecord;
  owned: NfdRecordCollection;
};

/**
 * TODO: Manage background
 * @param nfd
 * @param owned
 * @param iconVerified
 * @param iconUrl
 * @param backgroundVerified
 * @param backgroundUrl
 * @constructor
 */
export function Card({
  nfd,
  owned,
  iconVerified,
  iconUrl,
  backgroundVerified,
  backgroundUrl,
}: CardProps) {
  return (
    <RadCard className="rounded-3xl max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="overflow-visible">
            <AvatarImage
              className={`rounded-3xl ${iconVerified ? "animate-pulse" : ""}`}
              src={iconUrl}
            />
            <AvatarFallback>{nfd.name[0]}</AvatarFallback>
          </Avatar>
          <p className="flex-1">
            {nfd?.properties?.userDefined?.name || nfd.name}
          </p>
          <Button asChild variant="ghost" size="icon">
            <a data-astro-reload={true} href="/">
              <CircleX />
            </a>
          </Button>
        </CardTitle>
        <CardDescription className="truncate">{nfd.owner}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className="text-2xl">About</h1>
        <ul className="p-2">
          {nfd?.properties?.userDefined?.address && (
            <li>Location: {nfd?.properties?.userDefined?.address}</li>
          )}
          <li>Created: {new Date(nfd?.timeCreated || "").toDateString()}</li>
        </ul>
        {nfd?.properties?.userDefined?.bio && (
          <>
            <h1 className="text-2xl">Bio</h1>
            <p className="p-2">{nfd?.properties?.userDefined?.bio}</p>
          </>
        )}
      </CardContent>
      {owned.length > 0 && (
        <CardFooter>
          <div>
            <h1>Owned Accounts</h1>
            <div className="grid grid-cols-4 gap-4">
              {owned.map((acct) => (
                <a key={acct.appID} href={`/u/${acct.name}`}>
                  <Avatar>
                    <AvatarImage src={acct?.properties?.userDefined?.avatar} />
                    <AvatarFallback>{acct.name}</AvatarFallback>
                  </Avatar>
                </a>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </RadCard>
  );
}
