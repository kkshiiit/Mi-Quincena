.class public Lar/miquincena/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lar/miquincena/MainActivity$Bridge;
    }
.end annotation


# static fields
.field static final CLOUD_CREATE:I = 0x4

.field static final CLOUD_OPEN:I = 0x5

.field static final OPEN:I = 0x3

.field static final SAVE:I = 0x2


# instance fields
.field final bridge:Lar/miquincena/MainActivity$Bridge;

.field volatile cloudBusy:Z

.field volatile cloudPending:Z

.field volatile destroyed:Z

.field final io:Ljava/util/concurrent/ExecutorService;

.field pending:[B

.field pendingMime:Ljava/lang/String;

.field pendingName:Ljava/lang/String;

.field reminderConfig:Ljava/lang/String;

.field web:Landroid/webkit/WebView;


# direct methods
.method public constructor <init>()V
    .locals 1

    .line 3
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    .line 4
    new-instance v0, Lar/miquincena/MainActivity$Bridge;

    invoke-direct {v0, p0}, Lar/miquincena/MainActivity$Bridge;-><init>(Lar/miquincena/MainActivity;)V

    iput-object v0, p0, Lar/miquincena/MainActivity;->bridge:Lar/miquincena/MainActivity$Bridge;

    invoke-static {}, Ljava/util/concurrent/Executors;->newSingleThreadExecutor()Ljava/util/concurrent/ExecutorService;

    move-result-object v0

    iput-object v0, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    const/4 v0, 0x0

    iput-boolean v0, p0, Lar/miquincena/MainActivity;->destroyed:Z

    iput-boolean v0, p0, Lar/miquincena/MainActivity;->cloudBusy:Z

    iput-boolean v0, p0, Lar/miquincena/MainActivity;->cloudPending:Z

    .line 3
    return-void
.end method

.method static synthetic lambda$0(Landroid/view/View;Landroid/view/WindowInsets;)Landroid/view/WindowInsets;
    .locals 4

    .line 6
    invoke-static {}, Landroid/view/WindowInsets$Type;->systemBars()I

    move-result v0

    invoke-static {}, Landroid/view/WindowInsets$Type;->ime()I

    move-result v1

    or-int/2addr v0, v1

    invoke-virtual {p1, v0}, Landroid/view/WindowInsets;->getInsets(I)Landroid/graphics/Insets;

    move-result-object v0

    iget v1, v0, Landroid/graphics/Insets;->left:I

    iget v2, v0, Landroid/graphics/Insets;->top:I

    iget v3, v0, Landroid/graphics/Insets;->right:I

    iget v0, v0, Landroid/graphics/Insets;->bottom:I

    invoke-virtual {p0, v1, v2, v3, v0}, Landroid/view/View;->setPadding(IIII)V

    return-object p1
.end method

.method static synthetic lambda$3(Ljava/io/File;Ljava/lang/String;)Z
    .locals 0

    .line 13
    const-string p0, ".json"

    invoke-virtual {p1, p0}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result p0

    return p0
.end method

.method static synthetic lambda$4(Ljava/io/File;Ljava/io/File;)I
    .locals 2

    .line 13
    invoke-virtual {p1}, Ljava/io/File;->lastModified()J

    move-result-wide v0

    invoke-virtual {p0}, Ljava/io/File;->lastModified()J

    move-result-wide p0

    invoke-static {v0, v1, p0, p1}, Ljava/lang/Long;->compare(JJ)I

    move-result p0

    return p0
.end method


# virtual methods
.method applyReminder(Ljava/lang/String;)V
    .locals 2

    .line 35
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "reminder-config"

    invoke-interface {v0, v1, p1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    invoke-static {p0}, Lar/miquincena/ReminderService;->schedule(Landroid/content/Context;)V

    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0, p1}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string p1, "reminder"

    const/4 v1, 0x0

    invoke-virtual {v0, p1, v1}, Lorg/json/JSONObject;->optBoolean(Ljava/lang/String;Z)Z

    move-result p1

    if-eqz p1, :cond_0

    const-class p1, Landroid/app/NotificationManager;

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->getSystemService(Ljava/lang/Class;)Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/app/NotificationManager;

    invoke-virtual {p1}, Landroid/app/NotificationManager;->areNotificationsEnabled()Z

    move-result p1

    if-nez p1, :cond_0

    const-string p1, "Las notificaciones est\u00e1n desactivadas en Ajustes de Android."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :catch_0
    move-exception p1

    :cond_0
    :goto_0
    return-void
.end method

.method cloudStatus(Ljava/lang/String;)V
    .locals 2

    .line 10
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "cloud-status"

    invoke-interface {v0, v1, p1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    new-instance v0, Ljava/lang/StringBuilder;

    const-string v1, "window.onCloudStatus&&onCloudStatus("

    invoke-direct {v0, v1}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-static {p1}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {v0, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    const-string v0, ")"

    invoke-virtual {p1, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V

    return-void
.end method

.method displayName(Landroid/net/Uri;)Ljava/lang/String;
    .locals 7

    .line 11
    const/4 v0, 0x0

    :try_start_0
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    const-string v2, "_display_name"

    filled-new-array {v2}, [Ljava/lang/String;

    move-result-object v3

    const/4 v5, 0x0

    const/4 v6, 0x0

    const/4 v4, 0x0

    move-object v2, p1

    invoke-virtual/range {v1 .. v6}, Landroid/content/ContentResolver;->query(Landroid/net/Uri;[Ljava/lang/String;Ljava/lang/String;[Ljava/lang/String;Ljava/lang/String;)Landroid/database/Cursor;

    move-result-object p1
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_1

    if-eqz p1, :cond_2

    :try_start_1
    invoke-interface {p1}, Landroid/database/Cursor;->moveToFirst()Z

    move-result v1

    if-eqz v1, :cond_2

    const/4 v1, 0x0

    invoke-interface {p1, v1}, Landroid/database/Cursor;->getString(I)Ljava/lang/String;

    move-result-object v1
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    if-eqz p1, :cond_0

    :try_start_2
    invoke-interface {p1}, Landroid/database/Cursor;->close()V

    :cond_0
    return-object v1

    :catchall_0
    move-exception v0

    if-eqz p1, :cond_1

    invoke-interface {p1}, Landroid/database/Cursor;->close()V

    :cond_1
    throw v0

    :cond_2
    if-eqz p1, :cond_5

    invoke-interface {p1}, Landroid/database/Cursor;->close()V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_1

    goto :goto_0

    :catchall_1
    move-exception p1

    if-eqz v0, :cond_4

    if-eq v0, p1, :cond_3

    :try_start_3
    invoke-virtual {v0, p1}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    :cond_3
    move-object p1, v0

    :cond_4
    throw p1
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_0

    :catch_0
    move-exception p1

    :cond_5
    :goto_0
    const-string p1, "Respaldo JSON"

    return-object p1
.end method

.method declared-synchronized finishCloud()V
    .locals 2

    monitor-enter p0

    .line 37
    const/4 v0, 0x0

    :try_start_0
    iput-boolean v0, p0, Lar/miquincena/MainActivity;->cloudBusy:Z

    iget-boolean v1, p0, Lar/miquincena/MainActivity;->destroyed:Z

    if-nez v1, :cond_2

    iget-object v1, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    invoke-interface {v1}, Ljava/util/concurrent/ExecutorService;->isShutdown()Z

    move-result v1

    if-eqz v1, :cond_0

    goto :goto_1

    :cond_0
    iget-boolean v1, p0, Lar/miquincena/MainActivity;->cloudPending:Z

    if-eqz v1, :cond_1

    iput-boolean v0, p0, Lar/miquincena/MainActivity;->cloudPending:Z

    invoke-virtual {p0, v0}, Lar/miquincena/MainActivity;->syncCloud(Z)V
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :cond_1
    :goto_0
    monitor-exit p0

    return-void

    :cond_2
    :goto_1
    :try_start_1
    iput-boolean v0, p0, Lar/miquincena/MainActivity;->cloudPending:Z
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    goto :goto_0

    .line 37
    :catchall_0
    move-exception v0

    monitor-exit p0

    throw v0
.end method

.method js(Ljava/lang/String;)V
    .locals 1

    .line 9
    new-instance v0, Lar/miquincena/MainActivity$$ExternalSyntheticLambda5;

    invoke-direct {v0, p0, p1}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda5;-><init>(Lar/miquincena/MainActivity;Ljava/lang/String;)V

    invoke-virtual {p0, v0}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method synthetic lambda$1$ar-miquincena-MainActivity(Ljava/lang/String;)V
    .locals 1

    .line 8
    iget-boolean v0, p0, Lar/miquincena/MainActivity;->destroyed:Z

    if-nez v0, :cond_0

    const/4 v0, 0x1

    invoke-static {p0, p1, v0}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object p1

    invoke-virtual {p1}, Landroid/widget/Toast;->show()V

    :cond_0
    return-void
.end method

.method synthetic lambda$2$ar-miquincena-MainActivity(Ljava/lang/String;)V
    .locals 2

    .line 9
    iget-boolean v0, p0, Lar/miquincena/MainActivity;->destroyed:Z

    if-nez v0, :cond_0

    iget-object v0, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    const/4 v1, 0x0

    invoke-virtual {v0, p1, v1}, Landroid/webkit/WebView;->evaluateJavascript(Ljava/lang/String;Landroid/webkit/ValueCallback;)V

    :cond_0
    return-void
.end method

.method synthetic lambda$5$ar-miquincena-MainActivity(Ljava/lang/String;Z)V
    .locals 7

    .line 38
    const-string v0, "cloud-hash"

    :try_start_0
    const-string v1, "Revisando el archivo vinculado\u2026"

    invoke-virtual {p0, v1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V

    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object p1

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    invoke-virtual {v1, p1}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;

    move-result-object v1

    const/high16 v2, 0xa00000

    invoke-virtual {p0, v1, v2}, Lar/miquincena/MainActivity;->read(Ljava/io/InputStream;I)[B

    move-result-object v1

    invoke-virtual {p0, v1}, Lar/miquincena/MainActivity;->sha([B)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v3

    const-string v4, ""

    invoke-interface {v3, v0, v4}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    iget-object v4, p0, Lar/miquincena/MainActivity;->bridge:Lar/miquincena/MainActivity$Bridge;

    invoke-virtual {v4}, Lar/miquincena/MainActivity$Bridge;->load()Ljava/lang/String;

    move-result-object v4

    new-instance v5, Lorg/json/JSONObject;

    invoke-direct {v5, v4}, Lorg/json/JSONObject;-><init>(Ljava/lang/String;)V

    const-string v6, "rows"

    invoke-virtual {v5, v6}, Lorg/json/JSONObject;->has(Ljava/lang/String;)Z

    move-result v5

    if-eqz v5, :cond_7

    sget-object v5, Ljava/nio/charset/StandardCharsets;->UTF_8:Ljava/nio/charset/Charset;

    invoke-virtual {v4, v5}, Ljava/lang/String;->getBytes(Ljava/nio/charset/Charset;)[B

    move-result-object v4

    if-nez p2, :cond_0

    invoke-virtual {v3, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p2

    if-nez p2, :cond_0

    invoke-virtual {p0, v4}, Lar/miquincena/MainActivity;->sha([B)Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p2, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p2

    if-nez p2, :cond_0

    const-string p1, "El archivo cambi\u00f3 afuera. Escritura detenida."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V

    const-string p1, "window.onCloudConflict&&onCloudConflict()"

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_2

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->finishCloud()V

    return-void

    :cond_0
    :try_start_1
    invoke-virtual {p0, v4}, Lar/miquincena/MainActivity;->sha([B)Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p2, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p2

    if-nez p2, :cond_6

    array-length p2, v1

    if-lez p2, :cond_1

    invoke-virtual {p0, v1}, Lar/miquincena/MainActivity;->snapshot([B)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0
    .catchall {:try_start_1 .. :try_end_1} :catchall_2

    :cond_1
    const/4 p2, 0x0

    :try_start_2
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    const-string v2, "wt"

    invoke-virtual {v1, p1, v2}, Landroid/content/ContentResolver;->openOutputStream(Landroid/net/Uri;Ljava/lang/String;)Ljava/io/OutputStream;

    move-result-object p1
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_1

    if-eqz p1, :cond_2

    :try_start_3
    invoke-virtual {p1, v4}, Ljava/io/OutputStream;->write([B)V
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    if-eqz p1, :cond_6

    :try_start_4
    invoke-virtual {p1}, Ljava/io/OutputStream;->close()V
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_1

    goto :goto_2

    :catchall_0
    move-exception p2

    goto :goto_0

    :cond_2
    :try_start_5
    new-instance p2, Ljava/io/IOException;

    invoke-direct {p2}, Ljava/io/IOException;-><init>()V

    throw p2
    :try_end_5
    .catchall {:try_start_5 .. :try_end_5} :catchall_0

    :goto_0
    if-eqz p1, :cond_3

    :try_start_6
    invoke-virtual {p1}, Ljava/io/OutputStream;->close()V

    :cond_3
    throw p2
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_1

    :catchall_1
    move-exception p1

    if-eqz p2, :cond_5

    if-eq p2, p1, :cond_4

    :try_start_7
    invoke-virtual {p2, p1}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    :cond_4
    move-object p1, p2

    :cond_5
    :goto_1
    throw p1

    :cond_6
    :goto_2
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object p1

    invoke-interface {p1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object p1

    invoke-virtual {p0, v4}, Lar/miquincena/MainActivity;->sha([B)Ljava/lang/String;

    move-result-object p2

    invoke-interface {p1, v0, p2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p1

    invoke-interface {p1}, Landroid/content/SharedPreferences$Editor;->apply()V

    new-instance p1, Ljava/lang/StringBuilder;

    const-string p2, "Respaldo entregado al proveedor \u00b7 "

    invoke-direct {p1, p2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    new-instance p2, Ljava/text/SimpleDateFormat;

    const-string v0, "dd/MM HH:mm"

    invoke-static {}, Ljava/util/Locale;->getDefault()Ljava/util/Locale;

    move-result-object v1

    invoke-direct {p2, v0, v1}, Ljava/text/SimpleDateFormat;-><init>(Ljava/lang/String;Ljava/util/Locale;)V

    new-instance v0, Ljava/util/Date;

    invoke-direct {v0}, Ljava/util/Date;-><init>()V

    invoke-virtual {p2, v0}, Ljava/text/SimpleDateFormat;->format(Ljava/util/Date;)Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    const-string p2, ". La subida a Drive depende de su conexi\u00f3n."

    invoke-virtual {p1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V

    goto :goto_3

    :cond_7
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V
    :try_end_7
    .catch Ljava/lang/Exception; {:try_start_7 .. :try_end_7} :catch_0
    .catchall {:try_start_7 .. :try_end_7} :catchall_2

    goto :goto_1

    :catchall_2
    move-exception p1

    goto :goto_4

    :catch_0
    move-exception p1

    :try_start_8
    const-string p1, "No se pudo actualizar el respaldo. Tus datos locales est\u00e1n a salvo. Revis\u00e1 red, espacio y permisos del archivo."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V
    :try_end_8
    .catchall {:try_start_8 .. :try_end_8} :catchall_2

    :goto_3
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->finishCloud()V

    return-void

    :goto_4
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->finishCloud()V

    throw p1
.end method

.method synthetic lambda$6$ar-miquincena-MainActivity(I[BLandroid/net/Uri;)V
    .locals 2

    .line 42
    const/4 v0, 0x2

    if-ne p1, v0, :cond_6

    if-eqz p2, :cond_5

    const/4 p1, 0x0

    :try_start_0
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    const-string v1, "wt"

    invoke-virtual {v0, p3, v1}, Landroid/content/ContentResolver;->openOutputStream(Landroid/net/Uri;Ljava/lang/String;)Ljava/io/OutputStream;

    move-result-object p3
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_1

    if-eqz p3, :cond_1

    :try_start_1
    invoke-virtual {p3, p2}, Ljava/io/OutputStream;->write([B)V
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    if-eqz p3, :cond_0

    :try_start_2
    invoke-virtual {p3}, Ljava/io/OutputStream;->close()V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_1

    :cond_0
    :try_start_3
    const-string p1, "Archivo entregado al proveedor de almacenamiento"

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_0

    goto :goto_2

    :catchall_0
    move-exception p1

    goto :goto_0

    :cond_1
    :try_start_4
    new-instance p1, Ljava/io/IOException;

    invoke-direct {p1}, Ljava/io/IOException;-><init>()V

    throw p1
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    :goto_0
    if-eqz p3, :cond_2

    :try_start_5
    invoke-virtual {p3}, Ljava/io/OutputStream;->close()V

    :cond_2
    throw p1
    :try_end_5
    .catchall {:try_start_5 .. :try_end_5} :catchall_1

    :catchall_1
    move-exception p2

    if-eqz p1, :cond_3

    if-eq p1, p2, :cond_4

    :try_start_6
    invoke-virtual {p1, p2}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_1

    :cond_3
    move-object p1, p2

    :cond_4
    :goto_1
    throw p1

    :cond_5
    new-instance p1, Ljava/io/IOException;

    const-string p2, "Repet\u00ed la exportaci\u00f3n"

    invoke-direct {p1, p2}, Ljava/io/IOException;-><init>(Ljava/lang/String;)V

    goto :goto_1

    :cond_6
    const/4 p2, 0x3

    if-ne p1, p2, :cond_7

    invoke-virtual {p0, p3}, Lar/miquincena/MainActivity;->displayName(Landroid/net/Uri;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object p2

    invoke-virtual {p2, p3}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;

    move-result-object p2

    const/high16 p3, 0xa00000

    invoke-virtual {p0, p2, p3}, Lar/miquincena/MainActivity;->read(Ljava/io/InputStream;I)[B

    move-result-object p2

    invoke-static {p2, v0}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;

    move-result-object p2

    new-instance p3, Ljava/lang/StringBuilder;

    const-string v0, "receiveFile("

    invoke-direct {p3, v0}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-static {p1}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p3, p1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    const-string p3, ","

    invoke-virtual {p1, p3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    invoke-static {p2}, Lorg/json/JSONObject;->quote(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p2

    invoke-virtual {p1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    const-string p2, ")"

    invoke-virtual {p1, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V
    :try_end_6
    .catch Ljava/lang/Exception; {:try_start_6 .. :try_end_6} :catch_0

    goto :goto_2

    :catch_0
    move-exception p1

    const-string p1, "No se pudo procesar el archivo. Revis\u00e1 su formato, tama\u00f1o o conexi\u00f3n."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :cond_7
    :goto_2
    return-void
.end method

.method synthetic lambda$7$ar-miquincena-MainActivity(Ljava/lang/String;)V
    .locals 2

    .line 44
    const-string v0, "true"

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-nez p1, :cond_0

    new-instance p1, Landroid/app/AlertDialog$Builder;

    invoke-direct {p1, p0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V

    const-string v0, "\u00bfCerrar Mi Quincena? Los cambios guardados se conservan."

    invoke-virtual {p1, v0}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    move-result-object p1

    new-instance v0, Lar/miquincena/MainActivity$$ExternalSyntheticLambda7;

    invoke-direct {v0, p0}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda7;-><init>(Lar/miquincena/MainActivity;)V

    const-string v1, "Cerrar"

    invoke-virtual {p1, v1, v0}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    move-result-object p1

    const-string v0, "Seguir"

    const/4 v1, 0x0

    invoke-virtual {p1, v0, v1}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;

    move-result-object p1

    invoke-virtual {p1}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;

    :cond_0
    return-void
.end method

.method synthetic lambda$8$ar-miquincena-MainActivity(Landroid/content/DialogInterface;I)V
    .locals 0

    .line 44
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->finish()V

    return-void
.end method

.method message(Ljava/lang/String;)V
    .locals 1

    .line 8
    new-instance v0, Lar/miquincena/MainActivity$$ExternalSyntheticLambda1;

    invoke-direct {v0, p0, p1}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda1;-><init>(Lar/miquincena/MainActivity;Ljava/lang/String;)V

    invoke-virtual {p0, v0}, Lar/miquincena/MainActivity;->runOnUiThread(Ljava/lang/Runnable;)V

    return-void
.end method

.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 3

    .line 40
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    const/4 v0, -0x1

    if-ne p2, v0, :cond_5

    if-eqz p3, :cond_5

    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object p2

    if-nez p2, :cond_0

    goto :goto_3

    :cond_0
    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object p2

    .line 41
    const/4 v0, 0x4

    if-eq p1, v0, :cond_2

    const/4 v1, 0x5

    if-ne p1, v1, :cond_1

    goto :goto_0

    .line 42
    :cond_1
    :try_start_0
    iget-object p3, p0, Lar/miquincena/MainActivity;->pending:[B

    iget-object v0, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v1, Lar/miquincena/MainActivity$$ExternalSyntheticLambda6;

    invoke-direct {v1, p0, p1, p3, p2}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda6;-><init>(Lar/miquincena/MainActivity;I[BLandroid/net/Uri;)V

    invoke-interface {v0, v1}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    .line 43
    goto :goto_2

    .line 41
    :cond_2
    :goto_0
    iget-boolean v1, p0, Lar/miquincena/MainActivity;->cloudBusy:Z

    if-eqz v1, :cond_3

    const-string p1, "Esper\u00e1 a que termine la operaci\u00f3n en curso."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    return-void

    :cond_3
    invoke-virtual {p3}, Landroid/content/Intent;->getFlags()I

    move-result p3

    and-int/lit8 p3, p3, 0x3

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v1

    invoke-virtual {v1, p2, p3}, Landroid/content/ContentResolver;->takePersistableUriPermission(Landroid/net/Uri;I)V

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object p3

    invoke-interface {p3}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object p3

    const-string v1, "cloud-uri"

    invoke-virtual {p2}, Landroid/net/Uri;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-interface {p3, v1, v2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p3

    const-string v1, "cloud-name"

    invoke-virtual {p0, p2}, Lar/miquincena/MainActivity;->displayName(Landroid/net/Uri;)Ljava/lang/String;

    move-result-object p2

    invoke-interface {p3, v1, p2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p2

    const-string p3, "cloud-hash"

    const-string v1, "review-required"

    invoke-interface {p2, p3, v1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p2

    invoke-interface {p2}, Landroid/content/SharedPreferences$Editor;->apply()V

    if-ne p1, v0, :cond_4

    iget-object p1, p0, Lar/miquincena/MainActivity;->bridge:Lar/miquincena/MainActivity$Bridge;

    invoke-virtual {p1}, Lar/miquincena/MainActivity$Bridge;->cloudReplace()V

    goto :goto_1

    :cond_4
    const-string p1, "Archivo vinculado. Revis\u00e1 su contenido antes de reemplazarlo."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->cloudStatus(Ljava/lang/String;)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->bridge:Lar/miquincena/MainActivity$Bridge;

    invoke-virtual {p1}, Lar/miquincena/MainActivity$Bridge;->cloudRead()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    :goto_1
    return-void

    .line 43
    :catch_0
    move-exception p1

    const-string p1, "No se pudo conservar el permiso. Eleg\u00ed nuevamente el archivo."

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_2
    return-void

    .line 40
    :cond_5
    :goto_3
    return-void
.end method

.method public onBackPressed()V
    .locals 3

    .line 44
    iget-object v0, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v1, Lar/miquincena/MainActivity$$ExternalSyntheticLambda8;

    invoke-direct {v1, p0}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda8;-><init>(Lar/miquincena/MainActivity;)V

    const-string v2, "(function(){var t=document.getElementById(\'search\');if(t&&!t.hidden){closeSearch();return true;}var d=document.getElementById(\'dialog\');if(d.open){d.close();return true;}if(tabName!==\'summary\'){go(\'summary\');return true;}return false;})()"

    invoke-virtual {v0, v2, v1}, Landroid/webkit/WebView;->evaluateJavascript(Ljava/lang/String;Landroid/webkit/ValueCallback;)V

    return-void
.end method

.method public onCreate(Landroid/os/Bundle;)V
    .locals 2

    .line 6
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance p1, Landroid/webkit/WebView;

    invoke-direct {p1, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V

    iput-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    const v0, -0x16110a

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->setContentView(Landroid/view/View;)V

    sget p1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v0, 0x1e

    if-lt p1, v0, :cond_0

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v0, Lar/miquincena/MainActivity$$ExternalSyntheticLambda0;

    invoke-direct {v0}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda0;-><init>()V

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setOnApplyWindowInsetsListener(Landroid/view/View$OnApplyWindowInsetsListener;)V

    :cond_0
    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    const/4 v0, 0x1

    invoke-virtual {p1, v0}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V

    const/4 v1, 0x0

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V

    invoke-virtual {p1, v0}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setAllowFileAccessFromFileURLs(Z)V

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setAllowUniversalAccessFromFileURLs(Z)V

    invoke-virtual {p1, v0}, Landroid/webkit/WebSettings;->setMixedContentMode(I)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v0, Landroid/webkit/WebChromeClient;

    invoke-direct {v0}, Landroid/webkit/WebChromeClient;-><init>()V

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    new-instance v0, Lar/miquincena/MainActivity$1;

    invoke-direct {v0, p0}, Lar/miquincena/MainActivity$1;-><init>(Lar/miquincena/MainActivity;)V

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    iget-object v0, p0, Lar/miquincena/MainActivity;->bridge:Lar/miquincena/MainActivity$Bridge;

    const-string v1, "Android"

    invoke-virtual {p1, v0, v1}, Landroid/webkit/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object p1, p0, Lar/miquincena/MainActivity;->web:Landroid/webkit/WebView;

    const-string v0, "file:///android_asset/index.html"

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    invoke-static {p0}, Lar/miquincena/ReminderService;->schedule(Landroid/content/Context;)V

    return-void
.end method

.method protected onDestroy()V
    .locals 1

    .line 45
    const/4 v0, 0x1

    iput-boolean v0, p0, Lar/miquincena/MainActivity;->destroyed:Z

    iget-object v0, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    invoke-interface {v0}, Ljava/util/concurrent/ExecutorService;->shutdown()V

    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V

    return-void
.end method

.method public onRequestPermissionsResult(I[Ljava/lang/String;[I)V
    .locals 0

    .line 36
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onRequestPermissionsResult(I[Ljava/lang/String;[I)V

    const/16 p2, 0xa

    if-ne p1, p2, :cond_1

    array-length p1, p3

    if-lez p1, :cond_0

    const/4 p1, 0x0

    aget p1, p3, p1

    if-nez p1, :cond_0

    iget-object p1, p0, Lar/miquincena/MainActivity;->reminderConfig:Ljava/lang/String;

    if-eqz p1, :cond_0

    iget-object p1, p0, Lar/miquincena/MainActivity;->reminderConfig:Ljava/lang/String;

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->applyReminder(Ljava/lang/String;)V

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object p1

    invoke-interface {p1}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object p1

    const-string p2, "reminder-config"

    invoke-interface {p1, p2}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object p1

    invoke-interface {p1}, Landroid/content/SharedPreferences$Editor;->apply()V

    invoke-static {p0}, Lar/miquincena/ReminderService;->schedule(Landroid/content/Context;)V

    const-string p1, "state.settings.reminder=false;try{save();}catch(e){};toast(\'Permiso denegado. No se activaron recordatorios.\');"

    invoke-virtual {p0, p1}, Lar/miquincena/MainActivity;->js(Ljava/lang/String;)V

    :cond_1
    :goto_0
    return-void
.end method

.method prefs()Landroid/content/SharedPreferences;
    .locals 2

    .line 5
    const-string v0, "miquincena"

    const/4 v1, 0x0

    invoke-virtual {p0, v0, v1}, Lar/miquincena/MainActivity;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v0

    return-object v0
.end method

.method read(Ljava/io/InputStream;I)[B
    .locals 5
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 7
    if-eqz p1, :cond_8

    const/4 v0, 0x0

    :try_start_0
    new-instance v1, Ljava/io/ByteArrayOutputStream;

    invoke-direct {v1}, Ljava/io/ByteArrayOutputStream;-><init>()V
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_1

    const/16 v2, 0x2000

    :try_start_1
    new-array v2, v2, [B

    :goto_0
    invoke-virtual {p1, v2}, Ljava/io/InputStream;->read([B)I

    move-result v3

    const/4 v4, -0x1

    if-ne v3, v4, :cond_1

    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->toByteArray()[B

    move-result-object p2
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    :try_start_2
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->close()V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_1

    if-eqz p1, :cond_0

    :try_start_3
    invoke-virtual {p1}, Ljava/io/InputStream;->close()V
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_2

    :cond_0
    return-object p2

    :cond_1
    :try_start_4
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->size()I

    move-result v4

    add-int/2addr v4, v3

    if-gt v4, p2, :cond_2

    const/4 v4, 0x0

    invoke-virtual {v1, v2, v4, v3}, Ljava/io/ByteArrayOutputStream;->write([BII)V

    goto :goto_0

    :cond_2
    new-instance p2, Ljava/io/IOException;

    const-string v0, "Archivo mayor a 10 MB"

    invoke-direct {p2, v0}, Ljava/io/IOException;-><init>(Ljava/lang/String;)V

    throw p2
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    :catchall_0
    move-exception p2

    move-object v0, p2

    :try_start_5
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->close()V

    throw v0
    :try_end_5
    .catchall {:try_start_5 .. :try_end_5} :catchall_1

    :catchall_1
    move-exception p2

    if-nez v0, :cond_3

    move-object v0, p2

    goto :goto_1

    :cond_3
    if-eq v0, p2, :cond_4

    :try_start_6
    invoke-virtual {v0, p2}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_1

    :catchall_2
    move-exception p1

    goto :goto_2

    :cond_4
    :goto_1
    if-eqz p1, :cond_5

    invoke-virtual {p1}, Ljava/io/InputStream;->close()V

    :cond_5
    throw v0
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_2

    :goto_2
    if-eqz v0, :cond_7

    if-eq v0, p1, :cond_6

    invoke-virtual {v0, p1}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    :cond_6
    move-object p1, v0

    :cond_7
    throw p1

    :cond_8
    new-instance p1, Ljava/io/IOException;

    const-string p2, "El proveedor no pudo abrir el archivo"

    invoke-direct {p1, p2}, Ljava/io/IOException;-><init>(Ljava/lang/String;)V

    throw p1
.end method

.method sha([B)Ljava/lang/String;
    .locals 5
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    .line 14
    const-string v0, "SHA-256"

    invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;

    move-result-object v0

    invoke-virtual {v0, p1}, Ljava/security/MessageDigest;->digest([B)[B

    move-result-object p1

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    array-length v1, p1

    const/4 v2, 0x0

    :goto_0
    if-lt v2, v1, :cond_0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p1

    return-object p1

    :cond_0
    aget-byte v3, p1, v2

    and-int/lit16 v3, v3, 0xff

    invoke-static {v3}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object v3

    filled-new-array {v3}, [Ljava/lang/Object;

    move-result-object v3

    const-string v4, "%02x"

    invoke-static {v4, v3}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v0, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    add-int/lit8 v2, v2, 0x1

    goto :goto_0
.end method

.method share()V
    .locals 4

    .line 39
    :try_start_0
    iget-object v0, p0, Lar/miquincena/MainActivity;->pending:[B

    if-eqz v0, :cond_2

    new-instance v0, Ljava/io/File;

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getCacheDir()Ljava/io/File;

    move-result-object v1

    const-string v2, "exports"

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/io/File;->mkdirs()Z

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v2

    invoke-static {v2, v3}, Ljava/lang/String;->valueOf(J)Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    const-string v2, "-"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    iget-object v2, p0, Lar/miquincena/MainActivity;->pendingName:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    new-instance v2, Ljava/io/File;

    invoke-direct {v2, v0, v1}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    const/4 v0, 0x0

    :try_start_1
    new-instance v3, Ljava/io/FileOutputStream;

    invoke-direct {v3, v2}, Ljava/io/FileOutputStream;-><init>(Ljava/io/File;)V
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_1

    :try_start_2
    iget-object v2, p0, Lar/miquincena/MainActivity;->pending:[B

    invoke-virtual {v3, v2}, Ljava/io/FileOutputStream;->write([B)V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :try_start_3
    invoke-virtual {v3}, Ljava/io/FileOutputStream;->close()V
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_1

    :try_start_4
    new-instance v0, Ljava/lang/StringBuilder;

    const-string v2, "content://ar.miquincena.files/"

    invoke-direct {v0, v2}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    invoke-static {v1}, Landroid/net/Uri;->encode(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    new-instance v1, Landroid/content/Intent;

    const-string v2, "android.intent.action.SEND"

    invoke-direct {v1, v2}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    iget-object v2, p0, Lar/miquincena/MainActivity;->pendingMime:Ljava/lang/String;

    invoke-virtual {v1, v2}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    move-result-object v1

    const-string v2, "android.intent.extra.STREAM"

    invoke-virtual {v1, v2, v0}, Landroid/content/Intent;->putExtra(Ljava/lang/String;Landroid/os/Parcelable;)Landroid/content/Intent;

    move-result-object v1

    const/4 v2, 0x1

    invoke-virtual {v1, v2}, Landroid/content/Intent;->addFlags(I)Landroid/content/Intent;

    move-result-object v1

    const-string v2, "Archivo"

    invoke-static {v2, v0}, Landroid/content/ClipData;->newRawUri(Ljava/lang/CharSequence;Landroid/net/Uri;)Landroid/content/ClipData;

    move-result-object v0

    invoke-virtual {v1, v0}, Landroid/content/Intent;->setClipData(Landroid/content/ClipData;)V

    const-string v0, "Compartir archivo"

    invoke-static {v1, v0}, Landroid/content/Intent;->createChooser(Landroid/content/Intent;Ljava/lang/CharSequence;)Landroid/content/Intent;

    move-result-object v0

    invoke-virtual {p0, v0}, Lar/miquincena/MainActivity;->startActivity(Landroid/content/Intent;)V
    :try_end_4
    .catch Ljava/lang/Exception; {:try_start_4 .. :try_end_4} :catch_0

    goto :goto_1

    :catchall_0
    move-exception v0

    :try_start_5
    invoke-virtual {v3}, Ljava/io/FileOutputStream;->close()V

    throw v0
    :try_end_5
    .catchall {:try_start_5 .. :try_end_5} :catchall_1

    :catchall_1
    move-exception v1

    if-eqz v0, :cond_0

    if-eq v0, v1, :cond_1

    :try_start_6
    invoke-virtual {v0, v1}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_0

    :cond_0
    move-object v0, v1

    :cond_1
    :goto_0
    throw v0

    :cond_2
    new-instance v0, Ljava/io/IOException;

    invoke-direct {v0}, Ljava/io/IOException;-><init>()V
    :try_end_6
    .catch Ljava/lang/Exception; {:try_start_6 .. :try_end_6} :catch_0

    goto :goto_0

    :catch_0
    move-exception v0

    const-string v0, "No se pudo compartir el archivo"

    invoke-virtual {p0, v0}, Lar/miquincena/MainActivity;->message(Ljava/lang/String;)V

    :goto_1
    return-void
.end method

.method snapshot([B)V
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 13
    new-instance v0, Ljava/io/File;

    invoke-virtual {p0}, Lar/miquincena/MainActivity;->getFilesDir()Ljava/io/File;

    move-result-object v1

    const-string v2, "backups"

    invoke-direct {v0, v1, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {v0}, Ljava/io/File;->mkdirs()Z

    new-instance v1, Ljava/io/File;

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-static {}, Ljava/lang/System;->currentTimeMillis()J

    move-result-wide v3

    invoke-static {v3, v4}, Ljava/lang/String;->valueOf(J)Ljava/lang/String;

    move-result-object v3

    invoke-direct {v2, v3}, Ljava/lang/StringBuilder;-><init>(Ljava/lang/String;)V

    const-string v3, "-"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-static {}, Ljava/util/UUID;->randomUUID()Ljava/util/UUID;

    move-result-object v3

    invoke-virtual {v3}, Ljava/util/UUID;->toString()Ljava/lang/String;

    move-result-object v3

    const/4 v4, 0x0

    const/16 v5, 0x8

    invoke-virtual {v3, v4, v5}, Ljava/lang/String;->substring(II)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v3, ".json"

    invoke-virtual {v2, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v0, v2}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    invoke-virtual {p0, v1, p1}, Lar/miquincena/MainActivity;->writeAtomic(Ljava/io/File;[B)V

    new-instance p1, Lar/miquincena/MainActivity$$ExternalSyntheticLambda2;

    invoke-direct {p1}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda2;-><init>()V

    invoke-virtual {v0, p1}, Ljava/io/File;->listFiles(Ljava/io/FilenameFilter;)[Ljava/io/File;

    move-result-object p1

    if-eqz p1, :cond_1

    new-instance v0, Lar/miquincena/MainActivity$$ExternalSyntheticLambda3;

    invoke-direct {v0}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda3;-><init>()V

    invoke-static {p1, v0}, Ljava/util/Arrays;->sort([Ljava/lang/Object;Ljava/util/Comparator;)V

    const/16 v0, 0xa

    :goto_0
    array-length v1, p1

    if-lt v0, v1, :cond_0

    goto :goto_1

    :cond_0
    aget-object v1, p1, v0

    invoke-virtual {v1}, Ljava/io/File;->delete()Z

    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_1
    :goto_1
    return-void
.end method

.method declared-synchronized syncCloud(Z)V
    .locals 3

    monitor-enter p0

    .line 38
    :try_start_0
    invoke-virtual {p0}, Lar/miquincena/MainActivity;->prefs()Landroid/content/SharedPreferences;

    move-result-object v0

    const-string v1, "cloud-uri"

    const-string v2, ""

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_1

    iget-boolean v1, p0, Lar/miquincena/MainActivity;->destroyed:Z

    if-nez v1, :cond_1

    iget-object v1, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    invoke-interface {v1}, Ljava/util/concurrent/ExecutorService;->isShutdown()Z

    move-result v1

    if-eqz v1, :cond_0

    goto :goto_0

    :cond_0
    iget-boolean v1, p0, Lar/miquincena/MainActivity;->cloudBusy:Z

    const/4 v2, 0x1

    if-eqz v1, :cond_2

    iput-boolean v2, p0, Lar/miquincena/MainActivity;->cloudPending:Z
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_0

    :cond_1
    :goto_0
    monitor-exit p0

    return-void

    :cond_2
    :try_start_1
    iput-boolean v2, p0, Lar/miquincena/MainActivity;->cloudBusy:Z

    iget-object v1, p0, Lar/miquincena/MainActivity;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v2, Lar/miquincena/MainActivity$$ExternalSyntheticLambda4;

    invoke-direct {v2, p0, v0, p1}, Lar/miquincena/MainActivity$$ExternalSyntheticLambda4;-><init>(Lar/miquincena/MainActivity;Ljava/lang/String;Z)V

    invoke-interface {v1, v2}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    goto :goto_0

    .line 38
    :catchall_0
    move-exception p1

    monitor-exit p0

    throw p1
.end method

.method writeAtomic(Ljava/io/File;[B)V
    .locals 1
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/io/IOException;
        }
    .end annotation

    .line 12
    new-instance v0, Landroid/util/AtomicFile;

    invoke-direct {v0, p1}, Landroid/util/AtomicFile;-><init>(Ljava/io/File;)V

    :try_start_0
    invoke-virtual {v0}, Landroid/util/AtomicFile;->startWrite()Ljava/io/FileOutputStream;

    move-result-object p1
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_1

    :try_start_1
    invoke-virtual {p1, p2}, Ljava/io/FileOutputStream;->write([B)V

    invoke-virtual {v0, p1}, Landroid/util/AtomicFile;->finishWrite(Ljava/io/FileOutputStream;)V
    :try_end_1
    .catch Ljava/io/IOException; {:try_start_1 .. :try_end_1} :catch_0

    return-void

    :catch_0
    move-exception p2

    goto :goto_0

    :catch_1
    move-exception p2

    const/4 p1, 0x0

    :goto_0
    if-eqz p1, :cond_0

    invoke-virtual {v0, p1}, Landroid/util/AtomicFile;->failWrite(Ljava/io/FileOutputStream;)V

    :cond_0
    throw p2
.end method
